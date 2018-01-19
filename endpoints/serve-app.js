const path = require('path');
const helpers = require('./helpers');
const config = require('../config');
const { URL_APP_PREFIX } = require('../shared/constants');

const env = config.get('env');

module.exports = {
  url: `${URL_APP_PREFIX}/*`,
  method: 'get',
  handlers: [
    (req, res) => {
      const file = 'index.html';
      const options = {
        root: path.resolve(__dirname, '..', 'public'),
        dotfiles: 'deny',
      };

      res.sendFile(file, options, err => {
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
