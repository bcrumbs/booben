/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co');
const fs = require('mz/fs');
const path = require('path');
const bodyParser = require('body-parser');
const rv = require('revalidator');
const config = require('../config');
const helpers = require('./helpers');
const constants = require('../common/constants');
const sharedConstants = require('../shared/constants');

const projectsDir = config.get('projectsDir');

const bodySchema = {
  properties: {
    routes: {
      required: false,
      type: 'array',
      items: {
        type: 'object',
        properties: {},
      },
    },
  },
};

const validationOptions = {
  validateFormats: true,
  validateFormatsStrict: true,
  validateFormatExtensions: true,
  additionalProperties: false,
  cast: false,
};

module.exports = {
  url: `${sharedConstants.URL_API_PREFIX}/projects/:name`,
  method: 'patch',
  handlers: [
    bodyParser.json(),

    (req, res) => void co(function* () {
      if (!constants.PROJECT_NAME_REGEX.test(req.params.name)) {
        helpers.sendError(res, 400, 'Invalid project name');
        return;
      }

      const { valid, errors } = rv.validate(
        req.body,
        bodySchema,
        validationOptions
      );

      if (!valid) {
        helpers.sendError(res, 400, 'Invalid request body', { errors });
        return;
      }

      const projectFile = path.join(
        projectsDir,
        req.params.name,
        constants.PROJECT_FILE
      );

      let projectDataJSON;

      try {
        projectDataJSON = yield fs.readFile(projectFile, { encoding: 'utf8' });
      } catch (err) {
        if (err.code === 'ENOENT')
          helpers.sendError(res, 404, 'Project not found');
        else
          helpers.sendError(res);

        return;
      }

      let projectData;

      try {
        projectData = JSON.parse(projectDataJSON);
      } catch (err) {
        helpers.sendError(res);
        return;
      }

      projectData = Object.assign(projectData, req.body);

      try {
        yield fs.writeFile(projectFile, JSON.stringify(projectData));
      } catch (err) {
        helpers.sendError(res);
        return;
      }

      helpers.sendJSON(res, 200, projectData);
    }),
  ],
};
