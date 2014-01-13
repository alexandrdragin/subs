'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');

var user = new mongoose.Schema({
    email: { type: String, required: true },
    username: { type: String, required: true }, // username to display
    login:  { type: String, required: false },  // lower case of username (automatically generates on create)
    role: { type: String, 'default': 'user' },

    // misc
    created: { type: Date, 'default': Date.now() },

    // password data
    secure: {
        salt: String,
        hashedPassword: String
    },

    disabled: { type: Boolean, 'default': false }
});


user
  .virtual('password')
    .set(function(password) {
        this._password = password;
        this.secure.salt = this.makeSalt();
        this.secure.hashedPassword = this.encryptPassword(password);
    })
    .get(function(val) { return val; });

user
  .virtual('passwordConfirmation')
    .set(function(password) {
        this._passwordConfirmation = password;
    })
    .get(function(val) { return val; });

user.path('email').validate(function(email) {
    var regex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
    return regex.test(email);
}, 'Invalid email address');

user.path('secure.hashedPassword').validate(function(password) {
    if (!password.length) {
        return this.invalidate('password', 'Password cannot be blank');
    }

    if (this._password !== this._passwordConfirmation) {
        this.invalidate('passwordConfirmation', 'Passwords must match');
    }

});

user.path('email').validate(function(email, callback) {
    if (!email) {
        return this.invalidate('email', 'Email is required');
    }

    var User = mongoose.model('User');

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('email')) {
        User.findOne({ email: email.toLowerCase() }).exec(function(err, user) {
            callback(!err && !user);
        });
    } else {
        callback(true);
    }
}, 'Email already exists');

user.path('username').validate(function(username, callback) {
    if (!username) {
        return this.invalidate('username', 'Username is required');
    }

    var User = mongoose.model('User');

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('username')) {
        User.findOne({ login: username.toLowerCase() }).exec(function (err, user) {
            callback(!err && !user);
        });
    } else {
        callback(true);
    }
}, 'Username already exists');

user.pre('save', function(next) {
    if (!this.isNew) {
        return next();
    }

    this.login = this.username.toLowerCase();
    this.email = this.email.toLowerCase();

    next();
});

user.method({
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    encryptPassword: function(password) {
        if (!password) {
            return '';
        }

        var encrypred;
        try {
            encrypred = crypto.createHmac('sha1', this.secure.salt).update(password).digest('hex');
            return encrypred;
        } catch (err) {
            return '';
        }
    }
});

module.exports = mongoose.model('User', user);
