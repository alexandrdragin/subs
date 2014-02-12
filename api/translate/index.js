'use strict';
var logger = require('../../logger');
var mongoose = require('mongoose');

var Doc = mongoose.model('Doc');
var User = mongoose.model('User');
var Item = mongoose.model('Item');

exports.init = function(io) {
    io.sockets.on('connection', function(socket) {
        socket.room = null;

        socket.on('translation:getInfo', getInfo);
        socket.on('translation:getPageCount', getPageCount);
        socket.on('translation:getItems', getItems);
        socket.on('translation:submitTranslation', submitTranslation);
        socket.on('translation:vote', voteTranslation);
    });
};

var getInfo = function(data, callback) {
    var socket = this;

    Doc.findById(data.id, function(err, doc) {
        if (err) {
            logger.error(err);
            return callback(['Server error'], null);
        }

        if (socket.room) {
            socket.leave(socket.room.name);
        }

        socket.room = {
            name: 'translation:room:' + doc.id,
            id: doc.id
        };

        socket.join(socket.room.name);

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

    Item.find({ doc: data.id })
        .sort('id')
        .skip(data.page * pageLimit)
        .limit(pageLimit)
        .populate('translations.user')
        .exec(function(err, items) {
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

var submitTranslation = function(data, callback) {
    var socket = this;
    var user = socket.handshake.user;

    Item.findById(data.id)
        .populate('doc translations.user')
        .exec(function(err, item) {
            if (err) {
                logger.error(err);
                return callback(['Server error'], null);
            }

            item.translations.push({
                text: data.text,
                user: user
            });

            item.save(function(err) {
                if (err) {
                    logger.error(err);
                    return callback(['Server error'], null);
                }

                item.doc.calculateProgress(function(err) {
                    if (err) {
                        logger.error(err);
                        return callback(['Server error'], null);
                    }

                    if (socket.room) {
                        socket.manager.sockets.in(socket.room.name).emit('translation:translationProgress', item.doc.progress);
                    }
                });

                if (socket.room) {
                    socket.manager.sockets.in(socket.room.name).emit('translation:newTranslation', item);
                }
            });
        });
};

var voteTranslation = function(data, callback) {
    var socket = this;
    var user = socket.handshake.user;

    Item.findById(data.iid)
        .populate('doc translations.user')
        .exec(function(err, item) {
            if (err) {
                logger.error(err);
                return callback(['Server error'], null);
            }

            var trans = null;
            for (var i = 0; i < item.translations.length; i++) {
                if (item.translations[i]._id.equals(data.tid)) {
                    trans = item.translations[i];
                }
            }

            if (!trans) {
                return callback(['Translation not found'], null);
            }

            for (i = 0; i < trans.voters.length; i++) {
                if (user._id.equals(trans.voters[i].user)) {
                    trans.rating -= trans.voters[i].vote;
                    trans.voters.splice(i, 1);
                }
            }

            data.vote = data.vote < 0 ? -1 : 1;
            trans.voters.push({
                vote: data.vote,
                user: user
            });

            trans.rating += data.vote;

            item.save(function(err) {
                if (err) {
                    logger.error(err);
                    return callback(['Server error'], null);
                }

                if (socket.room) {
                    socket.manager.sockets.in(socket.room.name).emit('translation:vote', {
                        iid: item._id,
                        tid: trans._id,
                        rating: trans.rating
                    });
                }
            });
        });
};

