var express = require('express');
var app = express();
var db = require('./app/db');

app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/threads', function(request, respond) {
    respond.setHeader('access-control-expose-headers', 'content-range, accept-range, link');
    respond.setHeader('Content-Type', 'application/json');
    db.getThreads(function(error, data) {
        respond.json(data);
    });
    // db.getById(1, 'threads', function(error, data) {
    //     if (error) {
    //         var errors = [];
    //         errors.push(error);
    //         return respond.json({
    //             "errors": errors
    //         });
    //     }
    //     respond.json(data);
    // });
});

// app.get('/threads/:threadId', function(request, response) {

// });

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
