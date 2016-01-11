var fs = require('fs');
module.exports = {};
var db = module.exports;
var local = {};

local.file = function(name) {
    return __dirname + '/data/' + name + '.json';
};

local.get = function(name, callback) {
    fs.readFile(local.file(name), 'utf8', function(error, data) {
        if (error) throw error;
        callback(error, JSON.parse(data));
    });
};

local.getById = function(id, name, callback) {
    local.get(name, function(error, data) {
        for (var i = 0, len = data[name].length; i < len; i++) {
            if (data[name][i].id && data[name][i].id === id) {
                callback(undefined, data[name][i]);
                return;
            }
        }
        callback('not_found', undefined);
    });
};

db.getUsers = function(callback) {
    local.get('users', function(error, data) {
        for (var i = 0; i < data['users'].length; i++) {
            delete data['users'][i]['password'];
        };
        callback(error, data);
    });
};

db.getThreads = function(callback) {
    local.get('threads', function(error, data) {
        db.addAuthors(data['threads'], function(error, data) {
            callback(error, data);
        });
    });
};

db.getPosts = function(threadId, callback) {
    local.get('posts', function(error, data) {
        for (var i = 0; i < data['posts'].length; i++) {
            if (data['posts'][i]['threadId'] !== threadId) {
                delete data['posts'][i];
            }
        };
        db.addAuthors(data['posts'], function(error, data) {
            callback(error, data);
        });
    });
};

db.addAuthors = function(data, callback) {
    db.getUsers(function(error, users) {
        var users = users['users'];
        for (var i = 0; i < data.length; i++) {
            if (data[i].author) {
                for (var i = 0; i < users.length; i++) {
                    if (data[i].author === users[i].username) {
                        data[i].author = users[i];
                    }
                };
            }
        };
        callback(error, data);
    });
};
