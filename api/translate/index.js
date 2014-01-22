'use strict';
var logger = require('../../logger');
var mongoose = require('mongoose');

var Doc = mongoose.model('Doc');
var User = mongoose.model('User');
var Item = mongoose.model('Item');

exports.init = function(io) {
    io.sockets.on('connection', function(socket) {
        socket.on('translation:getInfo', getInfo);
        socket.on('translation:getPageCount', getPageCount);
        socket.on('translation:getItems', getItems);
    });
};

var getInfo = function(data, callback) {
    Doc.findById(data.id, function(err, doc) {
        if (err) {
            logger.error(err);
            return callback(['Server error'], null);
        }

        callback(err, doc);
    });
};

var getPageCount = function(data, callback) {
    var socket = this;
    var user = socket.handshake.user;

    var pageLimit = /* user.settings.translationPageLimit || */ 20;

    Item.count({ doc: data.id }, function(err, count) {
        if (err) {
            logger.error(err);
            return callback(['Server error'], null);
        }

        callback(err, Math.ceil(count / pageLimit));
    });
};

var getItems = function(data, callback) {
    var socket = this;
    var user = socket.handshake.user;

    var pageLimit = /* user.settings.translationPageLimit || */ 20;
    data.page = data.page || 1;
    data.page--;

    Item.find({ doc: data.id }, null, { skip: data.page * pageLimit, limit: pageLimit, sort: 'id' }, function(err, items) {
        if (err) {
            logger.error(err);
            return callback(['Server error'], null);
        }

        if (!items.length) {
            return callback(['Translations not found'], null);
        }

        callback(err, items);
    });
};
