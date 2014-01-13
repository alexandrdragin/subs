module.exports = require('tracer').colorConsole({
    level: 'log',
    format : "{{timestamp}} <{{title}}> {{message}} ({{path}}:{{line}})",
    dateformat : "dd mmm HH:MM:ss"
});
