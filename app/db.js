function database() {
    'use strict';
    var fs = require('fs');
    module.exports = {};
    var db = module.exports;
    var local = {};
    var i, j;

    local.file = function (name) {
        return __dirname + '/data/' + name + '.json';
    };

    local.get = function (name, callback) {
        fs.readFile(local.file(name), 'utf8', function (error, data) {
            if (error || !data) {
                return callback('databaseFileReadError', []);
            }
            callback(error, JSON.parse(data));
        });
    };

    local.save = function (name, data, callback) {
        fs.writeFile(local.file(name), data, 'utf8', function (error, data) {
            if (error) {
                return callback('databaseFileWriteError', []);
            }
            callback(error, data);
        });
    };

    local.addAuthors = function (data, callback) {
        local.getUsers(function (error, users) {
            for (i = 0; i < data.length; i += 1) {
                if (data[i].author) {
                    for (j = 0; j < users.length; j += 1) {
                        if (data[i].author === users[j].username) {
                            data[i].author = users[j];
                        }
                    }
                }
            }
            callback(error, data);
        });
    };

    local.getUsers = function (callback) {
        local.get('users', function (error, users) {
            for (i = 0; i < users.length; i += 1) {
                delete users[i].password;
            }
            callback(error, users);
        });
    };

    local.getLastThreadId = function (callback) {
        local.get('threads', function (error, posts) {
            var lastId = 0;
            for (i = 0; i < posts.length; i += 1) {
                if (lastId < posts[i].id) {
                    lastId = posts[i].id;
                }
            }
            callback(error, lastId);
        });
    };

    local.getLastPostId = function (callback) {
        local.get('posts', function (error, posts) {
            var lastId = 0;
            for (i = 0; i < posts.length; i += 1) {
                if (lastId < posts[i].id) {
                    lastId = posts[i].id;
                }
            }
            callback(error, lastId);
        });
    };

    db.clear = function () {
        var files = ['threads', 'posts', 'users'];
        for (i = 0; i < files.length; i += 1) {
            local.save(files[i], [], function (error, data) {});
        };
    };

    db.getById = function (id, name, callback) {
        local.get(name, function (error, data) {
            for (i = 0; i < data.length; i += 1) {
                if (data[i].id && data[i].id === id) {
                    return callback(undefined, data[i]);
                }
            }
            callback('notFound', undefined);
        });
    };

    db.getUser = function (username, callback) {
        local.get('users', function (error, users) {
            for (i = 0; i < users.length; i += 1) {
                if (users[i].username === username) {
                    return callback(undefined, users[i]);
                }
            }
            callback('notFound', undefined);
        });
    };

    db.saveUser = function (user, callback) {
        local.get('users', function (error, users) {
            var userExists = false;
            for (i = 0; i < users.length; i += 1) {
                if (user.username === users[i].username) {
                    userExists = true;
                    break;
                }
            }
            if (!userExists) {
                users.push(user);
                return local.save('users', JSON.stringify(users), callback);
            }
            return callback('userExists', undefined);
        });
    };

    db.saveThread = function (thread, callback) {
        local.getLastThreadId(function (error, lastId) {
            local.get('threads', function (error, threads) {
                thread.id = lastId + 1;
                thread.url = '/threads/' + thread.id;
                thread.urlPosts = '/threads/' + thread.id + '/posts';
                thread.created = (new Date()).toISOString();
                threads.push(thread);
                local.save('threads', JSON.stringify(threads), function (error) {
                    callback(error, thread);
                });
            });
        });
    };

    db.updateThread = function (thread, callback) {
        if (!thread.id) {
            return callback('notFound');
        }
        local.get('threads', function (error, threads) {
            var found = false;
            for (i = 0; i < threads.length; i += 1) {
                if (threads[i].id === thread.id) {
                    threads[i].title = thread.title;
                    thread = threads[i];
                    found = true;
                }
            }
            if (found) {
                return local.save('threads', JSON.stringify(threads), function (error) {
                    callback(error, thread);
                });
            }
            return callback('notFound');
        });
    };

    db.savePost = function (post, callback) {
        local.getLastPostId(function (error, lastId) {
            local.get('posts', function (error, posts) {
                post.id = lastId + 1;
                post.created = (new Date()).toISOString();
                posts.push(post);
                local.save('posts', JSON.stringify(posts), function (error) {
                    callback(error, post);
                });
            });
        });
    };

    db.updatePost = function (post, callback) {
        if (!post.id) {
            return callback('notFound');
        }
        local.get('posts', function (error, posts) {
            var found = false;
            for (i = 0; i < posts.length; i += 1) {
                if (posts[i].id === post.id) {
                    posts[i].title = post.title;
                    post = posts[i];
                    found = true;
                    break;
                }
            }
            if (found) {
                return local.save('posts', JSON.stringify(posts), function (error) {
                    callback(error, post);
                });
            }
            return callback('notFound');
        });
    };

    db.getThreads = function (callback) {
        local.get('threads', function (error, threads) {
            local.addAuthors(threads, function (error, data) {
                callback(error, {
                    threads: data
                });
            });
        });
    };

    db.getPosts = function (threadId, callback) {
        local.get('posts', function (error, posts) {
            posts = posts.filter(function (post) {
                return post.threadId === threadId;
            });

            local.addAuthors(posts, function (error, data) {
                callback(error, {
                    posts: data
                });
            });
        });
    };
}

database();
