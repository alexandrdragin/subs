'use strict';

exports.init = function(app) {
    app.use(function(req, res, next) {
        res.http404 = error404;
        res.http500 = error500;
        next();
    });
};


var error404 = function(req, res) {
    res.statusCode = 404;

    res.end('page not found(404)');
};

var error500 = function(req, res) {
    res.statusCode = 500;

    res.end('server error (500)');
};
