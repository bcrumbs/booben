const path = require('path');
const helpers = require('./helpers');
const config = require('../config');

const env = config.get('env');

module.exports = {
  url: '/*',
  method: 'get',
  handlers: [
    (req, res) => {
      const options = {
        root: path.resolve(__dirname, '..', 'public'),
        dotfiles: 'deny',
      };

      res.sendFile(req.params[0], options, err => {
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
