'use strict';

var logger = require('./logger');
var socketAuth = require('passport.socketio');
var translation = require('./api/translate');
var express = require('express');

exports.init = function(server, app, redisStore) {
    var io = require('socket.io').listen(server);

    io.set('authorization', socketAuth.authorize({
        cookieParser: express.cookieParser,
        key: 'connect.sid',
        secret: app.config.session.secret,
        store: redisStore,
        success: function(data, accept) {
            logger.debug('Successful socket.io auth');
            accept(null, true);
        },
        fail: function(data, msg, err, accept) {
            if (err) {
                logger.error(err);
            }

            logger.debug('Socket.io auth error: ' + msg);
            accept(null, false);
        }
    }));

    translation.init(io);
};
