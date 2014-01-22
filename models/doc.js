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

    // items: [{ type: mongoose.Schema.ObjectId, ref: 'Item' }]
});

module.exports = mongoose.model('Doc', doc);
