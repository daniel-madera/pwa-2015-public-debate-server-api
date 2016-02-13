function server() {
    'use strict';
    var express = require('express');
    var app = express();
    var db = require('./app/db');
    var errors = require('./app/errors.js');

    app.use(function (request, response, next) {
        var data = '';
        request.on('data', function (chunk) {
            data += chunk;
        });
        request.on('end', function () {
            if (data) {
                request.body = JSON.parse(data);
            }
            next();
        });
    });

    app.use(function (request, response, next) {
        response.header('access-control-allow-origin', '*');
        response.header('access-control-allow-headers', 'origin, x-requested-with, content-type, accept, x-access-token');
        response.header('access-control-expose-headers', 'content-range, accept-range, link');
        response.header('access-control-allow-methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        response.header('content-type', 'application/json');
        next();
    });

    app.get('/', function (request, response, next) {
        response.status(200);
        response.json({
            'greetings': 'Welcome!'
        });
        response.end();
    });

    /// *** AUTHORIZED *** ///

    app.post('/threads', function (request, response, next) {
        if (!request.headers['x-access-token']) {
            return next('unauthorized');
        }
        request.body.author = request.headers['x-access-token'];
        next();
    });

    app.post('/threads/:threadId/posts', function (request, response, next) {
        if (!request.headers['x-access-token']) {
            return next('unauthorized');
        }
        request.body.author = request.headers['x-access-token'];
        next();
    });

    app.patch('/threads/:threadId', function (request, response, next) {
        var threadId = parseInt(request.params.threadId);
        db.getById(threadId, 'threads', function (error, data) {
            if (error) {
                return next(error);
            }
            if (data.author !== request.headers['x-access-token']) {
                return next('unauthorized');
            }
            next();
        });
    });

    app.patch('/threads/:threadId/posts/:postId', function (request, response, next) {
        var postId = parseInt(request.params.postId);
        db.getById(postId, 'posts', function (error, data) {
            if (error) {
                return next(error);
            }
            if (data.author !== request.headers['x-access-token']) {
                return next('unauthorized');
            }
            next();
        });
    });

    app.post('/users/login', function (request, response, next) {
        var user = request.body;
        db.getUser(user.username, function (error, data) {
            if (error) {
                return next('invalidLogin');
            }
            if (user.password && user.password === data.password) {
                data.token = user.username;
                delete data.password;
                response.status(200);
                response.json(data);
                response.end();
            } else {
                next('invalidLogin');
            }
        });
    });

    /// *** DATA FETCH *** ///

    app.get('/threads', function (request, response, next) {
        db.getThreads(function (error, data) {
            if (error) {
                return next(error);
            }
            response.status(200);
            response.json(data);
            response.end();
        });
    });

    app.get('/threads/:threadId', function (request, response, next) {
        var threadId = parseInt(request.params.threadId);
        db.getById(threadId, 'threads', function (error, data) {
            if (error) {
                return next(error);
            }
            response.status(200);
            response.json(data);
            response.end();
        });
    });

    app.get('/threads/:threadId/posts', function (request, response, next) {
        var threadId = parseInt(request.params.threadId);
        db.getPosts(threadId, function (error, data) {
            if (error) {
                return next(error);
            }
            response.status(200);
            response.json(data);
            response.end();
        });
    });

    /// *** DATA CREATE *** ///

    app.post('/threads', function (request, response, next) {
        var thread = request.body;
        db.saveThread(thread, function (error, data) {
            if (error) {
                return next(error);
            }
            response.status(201);
            response.json(data);
            response.end();
        });
    });

    app.post('/threads/:threadId/posts', function (request, response, next) {
        var post = request.body;
        var threadId = parseInt(request.params.threadId);
        post.threadId = threadId;
        db.savePost(post, function (error, data) {
            if (error) {
                return next(error);
            }
            response.status(201);
            response.json(data);
            response.end();
        });
    });

    app.post('/users', function (request, response, next) {
        var user = request.body;
        db.saveUser(user, function (error, data) {
            if (error) {
                return next(error);
            }
            response.status(201);
            response.json(data);
            response.end();
        });
    });

    /// *** DATA UPDATE *** ///

    app.patch('/threads/:threadId', function (request, response, next) {
        var thread = request.body;
        var threadId = parseInt(request.params.threadId);
        thread.id = threadId;
        db.updateThread(thread, function (error, data) {
            if (error) {
                return next(error);
            }
            response.status(200);
            response.json(data);
            response.end();
        });
    });

    app.patch('/threads/:threadId/posts/:postId', function (request, response, next) {
        var post = request.body;
        var threadId = parseInt(request.params.threadId);
        var postId = parseInt(request.params.postId);
        post.id = postId;
        post.threadId = threadId;
        db.updatePost(post, function (error, data) {
            if (error) {
                return next(error);
            }
            response.status(200);
            response.json(data);
            response.end();
        });
    });

    app.use(function (error, request, response, next) {
        var data, code;
        if (typeof error === 'string' && errors[error]) {
            code = errors[error].code;
            data = errors[error];
        } else if (error.code && error.message) {
            code = error.code;
            data = error;
        } else {
            code = 500;
            error = {
                errorObject: error
            };
            data = {
                code: code,
                message: 'Object error is not valid. ' + JSON.stringify(error)
            };
        }
        response.status(code);
        response.send(data);
        response.end();
    });

    app.listen(3000);
}

server();
