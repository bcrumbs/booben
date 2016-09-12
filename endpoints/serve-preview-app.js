/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    path = require('path'),
    config = require('../config'),
    constants = require('../common/constants');

const projectsDir = config.get('projectsDir');

module.exports = {
    url: `${constants.URL_PREVIEW_PREFIX}/:name/:filename`,
    method: 'get',
    handlers: [
        (req, res) => {
            if (!constants.PROJECT_NAME_REGEX.test(req.params.name)) {
                res.writeHead(400, {
                    'content-type': 'application/json'
                });

                res.end(JSON.stringify({
                    error: 'Invalid project name'
                }));

                return;
            }

            const options = {
                root: path.join(
                    projectsDir,
                    req.params.name,
                    constants.PROJECT_PREVIEW_BUILD_DIR
                ),

                dotfiles: 'deny'
            };

            res.sendFile(req.params.filename, options, err => {
                if (err) res.status(err.status).end();
            })
        }
    ]
};
