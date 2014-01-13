(function(exports) {
    var roles = {
        'public': 1,      // 0001
        'user': 2,        // 0010
        'moderator': 4,   // 0100
        'admin': 8        // 1000
    };

    var levels = {
        'anonymous': roles.public,
        'public': roles.public | roles.user | roles.moderator | roles.admin,
        'user': roles.user | roles.moderator | roles.admin,
        'moderator': roles.moderator | roles.admin,
        'admin': roles.admin
    };

    exports.roles = roles;
    exports.levels = levels;
})(typeof exports === 'undefined' ? this.accessConfig = {} : exports);