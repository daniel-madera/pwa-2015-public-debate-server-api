var express = require('express');
var app = express();
var db = require('./app/db');

app.use(function(request, response, next) {
    var data = '';
    request.on('data', function(chunk) {
        data += chunk;
    });
    request.on('end', function() {
        if (data) {
            request.body = JSON.parse(data);
        }
        next();
    });
});

app.use(function(request, response, next) {
    response.header("access-control-allow-origin", "*");
    response.header("access-control-allow-headers", "origin, x-requested-with, content-type, accept");
    response.header('access-control-expose-headers', 'content-range, accept-range, link');
    response.header('content-type', 'application/json');
    next();
});

app.get('/threads', function(request, response) {
    db.getThreads(function(error, data) {
        response.json(data);
        response.end();
    });
});

app.get('/threads/:threadId', function(request, response) {
    var threadId = parseInt(request.params.threadId);
    console.log(threadId);
    db.getById(threadId, 'threads', function(error, data) {
        console.log(error);
        response.json(data);
        response.end();
    });
});

app.get('/threads/:threadId/posts', function(request, response) {
    var threadId = parseInt(request.params.threadId);
    db.getPosts(threadId, function(error, data) {
        response.json(data);
        response.end();
    });
});

app.post('/threads', function(request, response) {
    db.saveThread(request.body, function(error, data) {
        response.json(data);
        response.end();
    });
});

app.listen(3000);
