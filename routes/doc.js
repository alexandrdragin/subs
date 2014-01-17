'use strict';
var mongoose = require('mongoose');
var logger = require('../logger');
var User = mongoose.model('User');
var Doc = mongoose.model('Doc');
var Iconv = require('iconv').Iconv;
var parser = require('subtitles-parser');
var fs = require('fs');


exports.init = function(app) {
    app.get('/doc/create', app.user.level('user'), docCreate);
    app.post('/doc/create', app.user.level('user'), docCreateSubmit);

    app.get('/doc/:did', app.user.level('public'), docView);
};

var languages = {
    en: 'English',
    ru: 'Russian'
};

var docCreate = function(req, res) {
    res.render('doc/create', {
        languages: languages,
        doc: new Doc(),
        validation: {},
        errors: {}
    });
};

var docCreateSubmit = function(req, res) {
    var data = req.body;
    var errors = [];

    var file = req.files ? req.files.file : null;
    if (!file) {
        errors.push('Please select file to upload');
    } else {
        if (file.size > 1024 * 1024) {
            errors.push('File too big (Maximum size is 1 MB)');
        }
    }

    if (!data.encoding) {
        errors.push('Select subtitles file encoding');
    }

    if (errors.length) {
        return res.render('doc/create', {
                languages: languages,
                doc: data,
                validation: {},
                errors: errors
            });
    }

    fs.readFile(file.path, 'utf-8', function(err, subsData) {
        if (err) {
            logger.error(err);
            return res.render('doc/create', {
                    languages: languages,
                    doc: data,
                    validation: {},
                    errors: ['Error while uploading file']
                });
        }

        if (data.encoding !== 'utf-8') {
            // convert upload to utf-8 before doing other stuff
            var iconv = new Iconv(data.encoding, 'utf-8');
            try {
                subsData = iconv.convert(subsData).toString();
            } catch (e) {
                return res.render('doc/create', {
                        languages: languages,
                        doc: data,
                        validation: {},
                        errors: ['Invalid file encoding']
                    });
            }
        }

        var subsItems = parser.fromSrt(subsData, true);

        if (!subsItems.length) {
            return res.render('doc/create', {
                    languages: languages,
                    doc: data,
                    validation: {},
                    errors: ['Wrong subtitles file']
                });
        }

        var doc = new Doc(data);
        doc.items = subsItems;
        doc.user = req.user;
        doc.save(function(err) {
            if (err) {
                var errors;
                var validation = {};

                if (err.name === 'ValidationError') {
                    validation = err.errors;
                } else {
                    logger.error(err);
                    errors = ['Server error'];
                }

                return res.render('doc/create', {
                    languages: languages,
                    doc: data,
                    errors: errors,
                    validation: validation
                });
            }

            res.redirect('/doc/' + doc.id);
        });
    });
};


var docView = function(req, res) {
    res.end('view');
};
