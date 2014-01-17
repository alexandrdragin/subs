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

    items: [{
        startTime: { type: Number, required: true },
        endTime: { type: Number, required: true },
        text: { type: String, required: true },

        translations: [{
            text: String,
            updated: { type: Date, default: Date.now },
            user: { type: mongoose.Schema.ObjectId, ref: 'User' },
            rating: { type: Number, default: 0 },
            voters: [{
                user: { type: mongoose.Schema.ObjectId, ref: 'User' },
                vote: Number
            }]
        }],

        comments: [{
            text: String,
            user: { type: mongoose.Schema.ObjectId, ref: 'User' },
            date: { type: Date, default: Date.now }
        }]


    }]
});

module.exports = mongoose.model('Doc', doc);
