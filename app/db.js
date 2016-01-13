var fs = require('fs');
module.exports = {};
var db = module.exports;
var local = {};

local.file = function(name) {
    return __dirname + '/data/' + name + '.json';
};

local.get = function(name, callback) {
    fs.readFile(local.file(name), 'utf8', function(error, data) {
        callback(error, JSON.parse(data));
    });
};

local.save = function(name, data, callback) {
    fs.writeFile(local.file(name), data, 'utf8', callback);
};

local.addAuthors = function(data, callback) {
    local.getUsers(function(error, users) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].author) {
                for (var j = 0; j < users.length; j++) {
                    if (data[i].author === users[j].username) {
                        data[i].author = users[j];
                    }
                };
            }
        };
        callback(error, data);
    });
};

local.getUsers = function(callback) {
    local.get('users', function(error, users) {
        for (var i = 0; i < users.length; i++) {
            delete users[i]['password'];
        };
        callback(error, users);
    });
};

local.getLastThreadId = function(callback) {
    local.get('threads', function(error, posts) {
        var lastId = 0;
        for (var i = 0; i < posts.length; i++) {
            if (lastId < posts[i].id) {
                lastId = posts[i].id;
            }
        };
        callback(error, lastId);
    });
};

local.getLastPostId = function(callback) {
    local.get('posts', function(error, posts) {
        var lastId = 0;
        for (var i = 0; i < posts.length; i++) {
            if (lastId < posts[i].id) {
                lastId = posts[i].id;
            }
        };
        callback(error, lastId);
    });
};

db.getById = function(id, name, callback) {
    local.get(name, function(error, data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].id && data[i].id === id) {
                return callback(undefined, data[i]);
            }
        }
        callback('not_found', undefined);
    });
};

db.getUser = function(username, callback) {
    local.getUsers(function(error, users) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                return callback(undefined, users[i]);
            }
        };
        callback('not_found', undefined);
    });
};

db.saveUser = function(user, callback) {
    local.get('users', function(error, users) {
        users.push(user);
        local.save('users', JSON.stringify(users), callback(error, user));
    });
};

db.saveThread = function(thread, callback) {
    if (thread.id) {
        local.get('threads', function(error, threads) {
            for (var i = 0; i < threads.length; i++) {
                if (threads[i].id === thread.id) {
                    threads[i].title = thread.title;
                    thread = threads[i];
                    break;
                }
            };
            local.save('threads', JSON.stringify(threads), callback(error, thread));
        });
    } else {
        local.getLastThreadId(function(error, lastId) {
            local.get('threads', function(error, threads) {
                thread.id = ++lastId;
                thread.url = '/threads/' + lastId;
                thread.urlPosts = '/threads/' + lastId + '/posts';
                thread.created = (new Date()).toISOString();
                threads.push(thread);
                callback(error, thread);
                local.save('threads', JSON.stringify(threads), callback(error, thread));
            });
        });
    }
};

db.savePost = function(post, callback) {
    if (post.id) {
        local.get('posts', function(error, posts) {
            for (var i = 0; i < threads.length; i++) {
                if (posts[i].id === thread.id) {
                    posts[i].text = posts.text;
                    post = posts[i];
                    break;
                }
            };
            local.save('posts', JSON.stringify(posts), callback(error, post));
        });
    } else {
        local.getLastPostId(function(error, lastId) {
            local.get('posts', function(error, posts) {
                post.id = ++lastId;
                post.created = (new Date()).toISOString();
                posts.push(post);
                local.save('posts', JSON.stringify(posts), callback(error, post));
            });
        });
    }
};

db.getThreads = function(callback) {
    local.get('threads', function(error, threads) {
        local.addAuthors(threads, function(error, data) {
            callback(error, {
                "threads": data
            });
        });
    });
};

db.getPosts = function(threadId, callback) {
    local.get('posts', function(error, posts) {
        posts = posts.filter(function(post) {
            return post.threadId === threadId;
        });

        local.addAuthors(posts, function(error, data) {
            callback(error, {
                "posts": data
            });
        });
    });
};
