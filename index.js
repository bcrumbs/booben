/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
  http = require('http'),
  express = require('express'),
  config = require('./config'),
  logger = require('./common/logger');

let httpServer;

const setupEndpoint = (app, endpoint) => {
  app[endpoint.method](endpoint.url, ...endpoint.handlers);
};

const cb = (resolve, reject) =>
  (err, res) => void (err ? reject(err) : resolve(res));

const start = () => co(function* () {
  const app = express();

  if (config.get('serveStatic')) {
    setupEndpoint(app, require('./endpoints/serve-designer-app'));
    setupEndpoint(app, require('./endpoints/serve-preview-app'));
  }

  setupEndpoint(app, require('./endpoints/get-project'));
  setupEndpoint(app, require('./endpoints/get-metadata'));
  setupEndpoint(app, require('./endpoints/create-project'));
  setupEndpoint(app, require('./endpoints/update-project'));

  httpServer = http.createServer(app);

  const port = config.get('port');

  yield new Promise((resolve, reject) =>
    void httpServer.listen(port, cb(resolve, reject)));

  logger.info(`Server is listening on port ${port}`);
});


co(function* () {
  try {
    yield start();
  } catch (err) {
    logger.critical(err);
    process.exit(1);
  }
});
