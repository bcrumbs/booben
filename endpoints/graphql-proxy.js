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
      
      const graphqlEndpointURL = project.graphQLEndpointURL;
      
      if (!graphqlEndpointURL) {
        helpers.sendError(
          res,
          400,
          `Project ${name} doesn't have GraphQL endpoint`
        );
        
        return;
      }
      
      // TODO: Proxy client's request to graphqlEndpointURL
    }),
  ],
};
