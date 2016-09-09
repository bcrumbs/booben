/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const path = require('path'),
    serveStatic = require('serve-static'),
    constants = require('../common/constants');

module.exports = {
    url: `${constants.URL_APP_PREFIX}/:name`,
    method: 'use',
    handlers: [
        serveStatic(path.resolve(path.join(__dirname, '..', 'public')))
    ]
};
