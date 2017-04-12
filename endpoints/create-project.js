/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co');
const fs = require('mz/fs');
const path = require('path');
const bodyParser = require('body-parser');
const rv = require('revalidator');
const prettyMs = require('pretty-ms');
const config = require('../config');
const helpers = require('./helpers');
const { buildComponentsBundle } = require('./components-bundle-builder');
const constants = require('../common/constants');
const sharedConstants = require('../shared/constants');
const logger = require('../common/logger');

const projectsDir = config.get('projectsDir');
const defaultComponentLibs = config.get('defaultComponentLibs');

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

const validationOptions = {
  validateFormats: true,
  validateFormatsStrict: true,
  validateFormatExtensions: true,
  additionalProperties: false,
  cast: false,
};

module.exports = {
  url: `${sharedConstants.URL_API_PREFIX}/projects`,
  method: 'post',
  handlers: [
    bodyParser.json(),

    (req, res) => void co(function* () {
      const { valid, errors } = rv.validate(
        req.body,
        bodySchema,
        validationOptions
      );

      if (!valid) {
        helpers.sendError(res, 400, 'Invalid request body', { errors });
        return;
      }

      const projectData = createProjectData(req.body);
      const projectDir = path.join(projectsDir, projectData.name);

      try {
        yield fs.mkdir(projectDir);
      } catch (err) {
        if (err.code === 'EEXIST')
          helpers.sendError(res, 400, 'Project already exists');
        else
          helpers.sendError(res);

        return;
      }

      const projectFile = path.join(projectDir, constants.PROJECT_FILE);
      const projectDataJSON = JSON.stringify(projectData);

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
      logger.info(
        `Building components bundle for project '${projectData.name}'...`
      );

      try {
        yield buildComponentsBundle(projectData);
      } catch (err) {
        let errorMessage = err.message || err.toString();
        if (err.errors) {
          const errors = err.errors
            .map(e => JSON.stringify(e))
            .join(', ');
          
          errorMessage += ` (${errors})`;
        }

        logger.error(
          `Components bundle build for project '${projectData.name}' ` +
          `failed: ${errorMessage}`
        );

        return;
      }

      const buildTime = Date.now() - buildStartTime;
      logger.info(
        `Components bundle build for project '${projectData.name}' ` +
        `finished in ${prettyMs(buildTime)}`
      );
    }),
  ],
};
