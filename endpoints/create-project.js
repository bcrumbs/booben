/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
  fs = require('mz/fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  rv = require('revalidator'),
  prettyMs = require('pretty-ms'),
  config = require('../config'),
  helpers = require('./helpers'),
  buildPreviewApp = require('./preview-builder').buildPreviewApp,
  constants = require('../common/constants'),
  sharedConstants = require('../shared/constants'),
  logger = require('../common/logger'),
  misc = require('../utils/misc');

const projectsDir = config.get('projectsDir'),
  defaultComponentLibs = config.get('defaultComponentLibs');

const bodySchema = {
  properties: {
    name: {
      type: 'string',
      allowEmpty: false,
      pattern: constants.PROJECT_NAME_REGEX,
      required: true,
    },

    author: {
      type: ['string', null],
      required: false,
    },

    componentLibs: {
      type: 'array',
      required: false,
      uniqueItems: true,
      items: {
        type: 'string',
      },
    },

    graphQLEndpointURL: {
      type: ['string', 'null'],
      required: false,
      allowEmpty: false,
      format: 'url',
    },
  },
};

const allowedFields = Object.keys(bodySchema.properties);

/**
 * @typedef {Object} CreateProjectInput
 * @property {string} name
 * @property {?string} [author]
 * @property {string[]} [componentLibs]
 * @property {?string} [graphQLEndpointURL]
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
  graphQLEndpointURL: input.graphQLEndpointURL || null,
  routes: [],
});

module.exports = {
  url: `${sharedConstants.URL_API_PREFIX}/projects`,
  method: 'post',
  handlers: [
    bodyParser.json(),

    (req, res) => void co(function* () {
      const input = misc.sanitizeObject(req.body, allowedFields),
        { valid, errors } = rv.validate(input, bodySchema);

      if (!valid) {
        helpers.sendError(res, 400, 'Invalid request body', { errors });
        return;
      }

      const projectData = createProjectData(input),
        projectDir = path.join(projectsDir, projectData.name);

      try {
        yield fs.mkdir(projectDir);
      } catch (err) {
        if (err.code === 'EEXIST')
          helpers.sendError(res, 400, 'Project already exists');
        else
          helpers.sendError(res);

        return;
      }

      const projectFile = path.join(projectDir, constants.PROJECT_FILE),
        projectDataJSON = JSON.stringify(projectData);

      try {
        yield fs.writeFile(projectFile, projectDataJSON);
      } catch (err) {
        // eslint-disable-next-line no-empty
        try { yield fs.rmdir(projectDir); } catch (err) {}
        helpers.sendError(res);
        return;
      }

      helpers.sendJSON(res, 200, projectDataJSON);

      const buildStartTime = Date.now();
      logger.info(`Building preview app for project '${projectData.name}'...`);

      try {
        yield buildPreviewApp(projectData);
      } catch (err) {
        let errorMessage = err.message || err.toString();
        if (err.errors) {
          const errors = err.errors
            .map(e => JSON.stringify(e))
            .join(', ');
          
          errorMessage += ` (${errors})`;
        }

        logger.error(
          `Preview app build for project '${projectData.name}' ` +
          `failed: ${errorMessage}`
        );

        return;
      }

      const buildTime = Date.now() - buildStartTime;
      logger.info(
        `Preview app build for project '${projectData.name}' ` +
        `finished in ${prettyMs(buildTime)}`
      );
    }),
  ],
};
