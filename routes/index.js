'use strict';

exports.init = function(app) {
    require('./user').init(app);

    app.get(/^\/partial\/([\da-zA-Z\/]+)$/, partial);
    app.get('/', index);
};

var partial = function(req, res) {
    var name = req.params[0];
    if (!name) {
        return;
    }
    res.render('partial/' + name);
};

var index = function(req, res) {
    res.render('index');
};
