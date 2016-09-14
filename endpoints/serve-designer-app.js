/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    path = require('path'),
    fs = require('mz/fs'),
    helpers = require('./helpers'),
    config = require('../config'),
    constants = require('../common/constants');

const projectsDir = config.get('projectsDir'),
    env = config.get('env');

module.exports = {
    url: `${constants.URL_APP_PREFIX}/:name/*`,
    method: 'get',
    handlers: [
        (req, res) => void co(function* () {
            const name = req.params.name;

            if (!constants.PROJECT_NAME_REGEX.test(name)) {
                // TODO: Serve 404 page
                helpers.sendError(res, 404, 'Project not found');
                return;
            }

            const options = {
                root: path.resolve(__dirname, '..', 'public'),
                dotfiles: 'deny'
            };

            let file = 'index.html';

            if (req.params[0]) {
                file = path.join(...req.params[0].split('/'));
                if (!(yield fs.exists(file))) file = 'index.html';
            }

            res.sendFile(file, options, err => {
                if (err) {
                    let message;
                    if (env === 'production') message = 'Server error';
                    else message = err.message;

                    if (err) helpers.sendError(res, err.status, message);
                }
            });
        })
    ]
};
