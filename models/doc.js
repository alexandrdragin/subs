'use strict';

var mongoose = require('mongoose');

var doc = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    permissions: [String],
    members: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],

    type: { type: String, default: 'subtitles' },
    title: { type: String, required: true },
    languageFrom: { type: String, required: true },
    languageTo: { type: String, required: true },
    updated: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 }
});

doc.pre('save', function(next) {
    this.updated = new Date();

    next();
});

doc.method({
    calculateProgress: function(callback) {
        var Item = mongoose.model('Item');
        var doc = this;

        Item.count({ doc: doc._id }, function(err, count) {
            if (err) { return callback(err); }
            Item.count({ doc: doc._id, haveTranslation: true}, function(err, vars) {
                if (err) { return callback(err); }
                doc.progress = vars / count;
                doc.save(callback);
            });
        });
    }
});

module.exports = mongoose.model('Doc', doc);
