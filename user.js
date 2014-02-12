'use strict';

var logger = require('./logger');
var mongoose = require('mongoose');
var accessConfig = require('./access-config');

// user model
var User = mongoose.model('User');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


exports.init = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    // user middleware
    app.use(function(req, res, next) {
        res.locals.user = req.user;

        next();
    });

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy(
        function(login, password, done) {
            User.findOne({ $or: [{ login: login.toLowerCase() }, { email: login.toLowerCase() }] }, '+email +hashedPassword +salt', function(err, user) {
                if (err) {
                    logger.error('Error fetching user: ' + err);
                    return done(err);
                }

                if (!user) {
                    logger.debug('User object is empty (User not found)');
                    return done(null, false, { message: 'Unknown user ' + login });
                }

                if (user.hashedPassword !== user.encryptPassword(password)) {
                    logger.debug('User password is incorrect');
                    return done(null, false, { message: 'Invalid password' });
                }

                return done(null, user);
            });
        }
    ));

    // user middleware
    app.use(function(req, res, next) {
        var user = {
            role: accessConfig.roles.public
        };

        if (req.user) {
            user = {
                _id: req.user._id,
                role: req.user.role,
                username: req.user.username,
                login: req.user.login
            };
        }

        res.cookie('user', JSON.stringify(user));

        next();
    });

    var level = function(requestedLevel) {
        return function(req, res, next) {
            var role = accessConfig.roles.public;
            if (req.user) {
                role = accessConfig.roles[req.user.role];
            }

            if (role & accessConfig.levels[requestedLevel]) {
                return next();
            }

            if (role === accessConfig.roles.public) {
                return res.redirect('/login');
            }

            return res.redirect('/403');
        };
    };

    // reference to middlewares for use in external routes
    app.user = {
        level: level
    };


    app.get('/logout', function(req, res) {
        req.logout();

        logger.debug('Logged out user');
        res.redirect('/');
    });
};