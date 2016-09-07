/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    fs = require('mz/fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    rv = require('revalidator'),
    config = require('../config'),
    helpers = require('./helpers'),
    constants = require('../common/constants'),
    misc = require('../utils/misc');

const projectsDir = config.get('projectsDir'),
    defaultComponentLibs = config.get('defaultComponentLibs');

const bodySchema = {
    properties: {
        name: {
            type: 'string',
            allowEmpty: false,
            pattern: constants.PROJECT_NAME_REGEX,
            required: true
        },

        author: {
            type: ['string', null],
            required: false
        },

        componentLibs: {
            type: 'array',
            required: false,
            uniqueItems: true,
            items: {
                type: 'string'
            }
        },

        relayEndpointURL: {
            type: ['string', 'null'],
            required: false,
            allowEmpty: false,
            format: 'url'
        }
    }
};

const allowedFields = Object.keys(bodySchema.properties);

/**
 * @typedef {Object} CreateProjectInput
 * @property {string} name
 * @property {?string} [author]
 * @property {string[]} [componentLibs]
 * @property {?string} [relayEndpointURL]
 */

/**
 * @typedef {Object} Project
 * @property {string} name
 * @property {?string} author
 * @property {string[]} componentLibs
 * @property {?string} relayEndpointURL
 * @property {Object[]} routes
 */

/**
 *
 * @param {CreateProjectInput} input
 * @returns {Project}
 */
const createProjectData = input => ({
    version: constants.PROJECT_FILE_VERSION,
    name: input.name,
    author: input.author || null,
    componentLibs: input.componentLibs || defaultComponentLibs,
    relayEndpointURL: input.relayEndpointURL || null,
    routes: []
});

module.exports = {
    url: '/api/v1/projects',
    method: 'post',
    handlers: [
        bodyParser.json(),

        (req, res) => void co(function* () {
            const input = misc.sanitizeObject(req.body, allowedFields),
                { valid, errors } = rv.validate(input, bodySchema);

            console.log(req);

            if (!valid) {
                helpers.sendError(res, 400, 'Invalid request body', { errors });
                return;
            }

            const projectData = createProjectData(input),
                projectDir = path.join(projectsDir, projectData.name);

            try {
                yield fs.mkdir(projectDir);
            }
            catch (err) {
                if (err.code === 'EEXIST') {
                    helpers.sendError(res, 400, 'Project already exists');
                }
                else {
                    helpers.sendError(res);
                }

                return;
            }

            const projectFile = path.join(projectDir, constants.PROJECT_FILE),
                projectDataJSON = JSON.stringify(projectData);

            try {
                yield fs.writeFile(projectFile, projectDataJSON);
            }
            catch (err) {
                try { yield fs.rmdir(projectDir) } catch (err) {}
                helpers.sendError(res);
                return;
            }

            helpers.sendJSON(res, 200, projectDataJSON);
        })
    ]
};
