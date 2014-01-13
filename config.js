'use strict';

module.exports = {
    dev: {
        mongo: 'mongodb://localhost/subs',

        redis: {
            host: 'localhost',
            port: '6379'
        },

        session: {
            secret: 'heyman-subtitles'
        }
    },

    production: {

    }
};
