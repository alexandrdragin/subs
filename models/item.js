var mongoose = require('mongoose');

var item = new mongoose.Schema({
    doc: { type: mongoose.Schema.ObjectId, ref: 'Doc' },
    id: { type: Number, required: true },
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
});

item.pre('save', function(next) {
    // sort translations by rating/time

    next();
});

module.exports = mongoose.model('Item', item);
