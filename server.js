'use strict';

var logger = require('./logger');
var express = require('express');
var fs = require('fs');

var http = require('http');
var path = require('path');

var app = express();

var config = require('./config');
app.config = config.dev;

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

// connect to mongo-db
var mongoose = require('mongoose');
mongoose.connect(app.config.mongo);
fs.readdirSync('./models').forEach(function(file) {
    if (~file.indexOf('.js')) {
        require('./models/' + file);
    }
});

// redis
var RedisStore = require('connect-redis')(express);
var redisStore = new RedisStore({
        host: app.config.redis.host,
        port: app.config.redis.port
    });

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.cookieParser());
app.use(express.urlencoded());
app.use(express.multipart());
app.use(express.methodOverride());

// sessions
app.use(express.session({
    secret: app.config.session.secret,
    store: redisStore,
    maxAge: { maxAge: new Date(Date.now() + 3600 * 24 * 30 * 1000) },
    cookie: { maxAge: new Date(Date.now() + 3600 * 24 * 30 * 1000) }
}));

require('./http-errors').init(app);

// general
// app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// 3rd party libraries
app.use('/lib', express.static(path.join(__dirname, 'lib')));


// client-access-config
app.use('/app/access-config.js', function(req, res, next) { res.sendfile(path.join(__dirname, 'access-config.js')); });

// client-apps
app.use('/app', express.static(path.join(__dirname, 'app')));

// passport.js initialization
require('./user').init(app);

// routes
require('./routes').init(app);
app.use(app.router);

var server = http.createServer(app);
require('./socket').init(server, app, redisStore);

server.listen(app.get('port'), function() {
    logger.info('Express server listening on port ' + app.get('port'));
});
