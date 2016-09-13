/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const path = require('path'),
    config = require('../config'),
    helpers = require('./helpers'),
    constants = require('../common/constants');

const projectsDir = config.get('projectsDir');

module.exports = {
    url: `${constants.URL_API_PREFIX}/projects/:name/metadata`,
    method: 'get',
    handlers: [
        (req, res) => {
            const name = req.params.name;

            if (!constants.PROJECT_NAME_REGEX.test(name)) {
                helpers.sendError(res, 400, 'Invalid project name');
                return;
            }

            const options = {
                root: path.join(projectsDir, name),
                headers: {
                    'content-type': 'application/json'
                }
            };

            res.sendFile(constants.PROJECT_COMPILED_METADATA_FILE, options, err => {
                if (err) helpers.sendError(res, err.status, err.message);
            });
        }
    ]
};
