const co = require('co');
const fs = require('mz/fs');
const path = require('path');
const bodyParser = require('body-parser');
const config = require('../config');
const helpers = require('./helpers');
const constants = require('../common/constants');
const sharedConstants = require('../shared/constants');

const projectsDir = config.get('projectsDir');

// TODO: Write project validator

module.exports = {
  url: `${sharedConstants.URL_API_PREFIX}/projects/:name`,
  method: 'put',
  handlers: [
    bodyParser.json({ limit: '50mb' }),

    (req, res) => void co(function* () {
      if (!constants.PROJECT_NAME_REGEX.test(req.params.name)) {
        helpers.sendError(res, 400, 'Invalid project name');
        return;
      }

      const projectFile = path.join(
        projectsDir,
        req.params.name,
        constants.PROJECT_FILE
      );

      try {
        yield fs.writeFile(projectFile, JSON.stringify(req.body));
      } catch (err) {
        if (err.code === 'ENOENT') {
          helpers.sendError(res, 404, 'Project not found');
        } else {
          helpers.sendError(res);
        }
        
        return;
      }

      helpers.sendJSON(res, 200, {});
    }),
  ],
};
