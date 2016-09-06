/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const path = require('path'),
    serveStatic = require('serve-static');

module.exports = {
    url: '/',
    method: 'get',
    handlers: [
        serveStatic(path.join(__dirname, '..', 'public'))
    ]
};
