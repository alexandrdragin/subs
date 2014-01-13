'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var logger = require('../logger');
var passport = require('passport');

exports.init = function(app) {
    app.get('/register', app.user.level('anonymous'), register);
    app.post('/register', app.user.level('anonymous'), registerSubmit);

    app.get('/login', app.user.level('anonymous'), login);
    app.post('/login', app.user.level('anonymous'), loginSubmit);

    app.get('/logout', app.user.level('user'), logout);

    app.get('/user/:login', app.user.level('public'), profile);
};

var logout = function(req, res) {
    req.logout();
    res.redirect('/');
};


var login = function(req, res) {
    res.render('user/login', {
        errors: [],
        account: {},
        validation: {}
    });
};

var loginSubmit = function(req, res, next) {
    var account = {} || req.body;

    passport.authenticate('local', function(err, user, info) {
        var errors = [];
        if (err) {
            logger.error(err);
            errors.push('Server error');
        }

        if (!user) {
            errors.push(info.message);
        }

        if (errors.length) {
            return res.render('user/login', {
                errors: errors,
                account: account,
                validation: {}
            });
        }

        req.login(user, function(err) {
            if (err) {
                logger.debug(err);
                return res.render('user/login', {
                    errors: ['Server error'],
                    account: account,
                    validation: {}
                });
            }

            return res.redirect('/');
        });

    })(req, res, next);
};

var register = function(req, res) {
    res.render('user/register', {
        account: {},
        errors: [],
        validation: {}
    });
};

var registerSubmit = function(req, res) {
    var data = req.body;

    var user = new User({
        email: data.email,
        username: data.username,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation
    });

    user.save(function(err) {
        if (err) {
            var errors;
            var validation = {};
            if (err.name === 'ValidationError') {
                validation = err.errors;
            } else {
                logger.error(err);
                errors = ['Server error'];
            }

            return res.render('user/register', {
                account: user,
                errors: errors,
                validation: validation
            });
        }

        logger.info('Successfully created new user ' + data.email + ', ' + data.username);
        res.redirect('/login');
    });
};

var profile = function(req, res) {
    var login = req.params.login;

    if (!login) {
        return res.status(404).redirect('/404');
    }

    User.findOne({ login: login }, function(err, user) {
        if (err || !user) {
            if (err) {
                logger.error(err);
            }
            return res.status(404).redirect('/404');
        }

        res.render('user/profile', {
            profile: user
        });
    });
};
