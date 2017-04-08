/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co');
const path = require('path');
const fs = require('mz/fs');
const helpers = require('./helpers');
const config = require('../config');
const constants = require('../common/constants');
const sharedConstants = require('../shared/constants');

const env = config.get('env');
const projectsDir = config.get('projectsDir');

module.exports = {
  url: `${sharedConstants.URL_APP_PREFIX}/:name/*`,
  method: 'get',
  handlers: [
    (req, res) => void co(function* () {
      const name = req.params.name;
      if (!constants.PROJECT_NAME_REGEX.test(name)) {
        // TODO: Serve 404 page
        helpers.sendError(res, 404, 'Project not found');
        return;
      }

      const rootDir = path.resolve(__dirname, '..', 'public');

      let options = {
        root: rootDir,
        dotfiles: 'deny',
      };

      let file = 'index.html';

      if (req.params[0]) {
        const parts = req.params[0].split('/');

        if (parts.length === 1 && parts[0] === '2.components.js') {
          file = 'bundle.js';

          options = {
            root: path.join(projectsDir, req.params.name),
            dotfiles: 'deny',
          };
        } else {
          file = path.join(...parts);
          if (!(yield fs.exists(path.join(rootDir, file)))) {
            file = parts.slice(1).join('/') || parts[0];
            if (!(yield fs.exists(path.join(rootDir, file))))
              file = 'index.html';
          }

          options = {
            root: rootDir,
            dotfiles: 'deny',
          };
        }
      }

      res.sendFile(file, options, err => {
        if (err) {
          let message;
          if (env === 'production') message = 'Server error';
          else message = err.message;

          if (err) helpers.sendError(res, err.status, message);
        }
      });
    }),
  ],
};
