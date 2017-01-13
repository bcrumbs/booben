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
  sharedConstants = require('../common/shared-constants'),
  misc = require('../utils/misc');

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

const allowedFields = Object.keys(bodySchema.properties);

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

      const input = misc.sanitizeObject(req.body, allowedFields),
        { valid, errors } = rv.validate(input, bodySchema);

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

      projectData = Object.assign(projectData, input);

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
