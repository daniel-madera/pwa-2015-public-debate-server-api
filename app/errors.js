function errorMessages() {
    'use strict';
    module.exports = {};
    var errors = module.exports;

    errors.userExists = {
        code: 400,
        message: 'Username already exists.'
    };

    errors.notFound = {
        code: 404,
        message: 'Resource was not found.'
    };

    errors.unauthorized = {
        code: 401,
        message: 'You are not allowed to perform this action.'
    };

    errors.invalidLogin = {
        code: 401,
        message: 'Your username or password does not match.'
    };

    errors.databaseFileWriteError = {
        code: 500,
        message: 'Error while writting to database file.'
    };

    errors.databaseFileReadError = {
        code: 500,
        message: 'Error while reading from database file.'
    };
}
errorMessages();
