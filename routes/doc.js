'use strict';
var mongoose = require('mongoose');
var logger = require('../logger');
var User = mongoose.model('User');
var Doc = mongoose.model('Doc');
var Item = mongoose.model('Item');
var Iconv = require('iconv').Iconv;
var parser = require('subtitles-parser');
var fs = require('fs');
var async = require('async');


exports.init = function(app) {
    app.get('/doc/create', app.user.level('user'), docCreate);
    app.post('/doc/create', app.user.level('user'), docCreateSubmit);

    app.get('/doc/:id', app.user.level('public'), docView);


    app.get('/doc/:id/download/original', app.user.level('public'), downloadOriginal);
    app.get('/doc/:id/download/translation', app.user.level('public'), downloadTranslation);
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

        async.each(subsItems, function(item, callback) {
            item.doc = doc;
            new Item(item).save(callback);
        }, function(err) {
            if (err) {
                return res.render('doc/create', {
                        languages: languages,
                        doc: data,
                        validation: {},
                        errors: ['Server error']
                    });
            }

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
    });
};


var docView = function(req, res) {
    var id = req.params.id;

    // res.http404(req, res);

    Doc.findById(id, '-items')
        .populate('user')
        .exec(function(err, doc) {
            if (err) {
                logger.error(err);
                return res.http500(req, res);
            }

            if (!doc) {
                return res.http404(req, res);
            }

            res.render('doc/view', {
                doc: doc
            });
        });
};

var downloadOriginal = function(req, res) {
    var id = req.params.id;

    Doc.findById({ id: id }, function(err, doc) {
        if (err) {
            logger.error(err);
            return res.http500(req, res);
        }

        if (!doc) {
            return res.http404(req, res);
        }

        try {
            var contents = parser.toSrt(doc.items);
            res.setHeader('Content-Disposition', 'attachment; filename=' + doc.title + '.srt');
            res.setHeader('Content-type', 'text/srt');
            return res.end(contents);
        } catch (err) {
            logger.error(err);
            return res.http500(req, res);
        }
    });
};

var downloadTranslation = function(req, res) {

};
