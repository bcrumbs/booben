/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    fs = require('mz/fs'),
    path = require('path'),
    config = require('../config'),
    helpers = require('./helpers'),
    constants = require('../common/constants');

const projectsDir = config.get('projectsDir');

module.exports = {
    url: '/api/v1/projects/:name',
    method: 'get',
    handlers: [
        (req, res) => void co(function* () {
            const name = req.params.name;

            if (!constants.PROJECT_NAME_REGEX.test(name)) {
                helpers.sendError(res, 400, 'Invalid project name');
                return;
            }

            const projectDir = path.join(projectsDir, name),
                projectFile = path.join(projectDir, constants.PROJECT_FILE);

            let data;

            try {
                data = yield fs.readFile(projectFile, { encoding: 'utf8' });
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    helpers.sendError(res, 404, 'Project not found');
                }
                else {
                    helpers.sendError(res);
                }

                return;
            }

            helpers.sendJSON(res, 200, data);
        })
    ]
};
