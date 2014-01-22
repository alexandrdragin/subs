'use strict';
var mongoose = require('mongoose');
var logger = require('../logger');
var User = mongoose.model('User');
var Doc = mongoose.model('Doc');


exports.init = function(app) {
    app.get(/^\/doc\/([\da-z]+)\/translate.*$/, app.user.level('user'), translate);
};

var translate = function(req, res) {
    var id = req.params[0];

    Doc.findById(id, '-items', function(err, doc) {
        if (err) {
            logger.error(err);
            return res.http500(req, res);
        }


        console.log(doc);
        if (!doc) {
            return res.http404(req, res);
        }

        res.render('doc/translate', {
            doc: doc
        });
    });
};
