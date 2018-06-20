const co = require('co');
const http = require('http');
const express = require('express');
const config = require('./config');
const logger = require('./common/logger');

let httpServer;

const setupEndpoint = (app, endpoint) => {
  app[endpoint.method](endpoint.url, ...endpoint.handlers);
};

const cb = (resolve, reject) =>
  (err, res) => void (err ? reject(err) : resolve(res));

const start = () => co(function* () {
  const app = express();

  setupEndpoint(app, require('./endpoints/get-project'));
  setupEndpoint(app, require('./endpoints/get-metadata'));
  setupEndpoint(app, require('./endpoints/create-project'));
  setupEndpoint(app, require('./endpoints/put-project'));
  setupEndpoint(app, require('./endpoints/graphql-proxy'));
  setupEndpoint(app, require('./endpoints/codegen'));

  if (config.get('serveStatic')) {
    setupEndpoint(app, require('./endpoints/serve-app'));
    setupEndpoint(app, require('./endpoints/serve-preview'));
    setupEndpoint(app, require('./endpoints/serve-bundle'));
    setupEndpoint(app, require('./endpoints/serve-assets'));
  }

  httpServer = http.createServer(app);

  const port = config.get('port');

  yield new Promise((resolve, reject) =>
    void httpServer.listen(port, cb(resolve, reject)));

  logger.info(`Server is listening on port ${port}. App is ready on localhost:${port}/app/:projectName`.);
});


co(function* () {
  try {
    yield start();
  } catch (err) {
    logger.critical(err);
    process.exit(1);
  }
});
