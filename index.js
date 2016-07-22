/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    config = require('./config');

co(function* () {

}).catch(err => {
    console.error(err);
    process.exit(1);
});
