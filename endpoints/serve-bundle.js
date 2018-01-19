const path = require('path');
const helpers = require('./helpers');
const config = require('../config');
const { URL_BUNDLE_PREFIX } = require('../shared/constants');

const env = config.get('env');
const projectsDir = config.get('projectsDir');

module.exports = {
  url: `${URL_BUNDLE_PREFIX}/:projectName/:filename`,
  method: 'get',
  handlers: [
    (req, res) => {
      const options = {
        root: path.resolve(projectsDir, req.params.projectName, 'build'),
        dotfiles: 'deny',
      };

      res.sendFile(req.params.filename, options, err => {
        if (err) {
          let message;
          if (env === 'production') message = 'Server error';
          else message = err.message;

          if (err) helpers.sendError(res, err.status, message);
        }
      });
    },
  ],
};
