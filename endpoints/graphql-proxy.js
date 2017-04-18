/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co');
const path = require('path');
const fs = require('mz/fs');
const url = require('url');
const http = require('http');
const https = require('https');
const _omit = require('lodash.omit');
const config = require('../config');
const helpers = require('./helpers');
const projectsCache = require('./projects-cache');
const constants = require('../common/constants');
const sharedConstants = require('../shared/constants');

const projectsDir = config.get('projectsDir');

module.exports = {
  url: `${sharedConstants.URL_GRAPHQL_PREFIX}/:name`,
  method: 'post',
  handlers: [
    (req, res) => void co(function* () {
      const name = req.params.name;
  
      if (!constants.PROJECT_NAME_REGEX.test(name)) {
        helpers.sendError(res, 400, 'Invalid project name');
        return;
      }
  
      let project = projectsCache.getProjectFromCache(name);
  
      if (!project) {
        const projectPath = path.join(
          projectsDir,
          name,
          constants.PROJECT_FILE
        );
        
        project = JSON.parse(yield fs.readFile(projectPath));
        projectsCache.putProjectToCache(name, project);
      }
      
      if (!project.graphQLEndpointURL) {
        const message = `Project ${name} doesn't have a GraphQL endpoint`;
        helpers.sendError(res, 404, message);
        return;
      }

      if (!project.proxyGraphQLEndpoint) {
        const message =
          `GraphQL endpoint proxying is not enabled in project ${name}`;

        helpers.sendError(res, 403, message);
        return;
      }

      const parsedURL = url.parse(project.graphQLEndpointURL);
      const iface = parsedURL.protocol === 'https:' ? https : http;
      const requestOptions = {
        protocol: parsedURL.protocol,
        hostname: parsedURL.hostname,
        port: parsedURL.port,
        path: parsedURL.path,
        method: req.method,
        headers: _omit(req.headers, [
          'host',
          'connection',
          'origin',
          'referer',
        ]),
      };

      const proxyReq = iface.request(requestOptions, proxyRes => {
        proxyRes.pipe(res, { end: true });
      });

      req.pipe(proxyReq, { end: true });
    }),
  ],
};
