/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { createNetworkInterface } from 'apollo-client';
import { URL_GRAPHQL_PREFIX } from '../../../shared/constants';

export const applyJWTMiddleware = (networkInterface, getToken) => {
  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) req.options.headers = {};
      const token = getToken();
      if (token) req.options.headers.Authorization = `Bearer ${token}`;
      next();
    },
  }]);
};

export const createNetworkInterfaceForProject = project => {
  const graphQLEndpointURL = project.proxyGraphQLEndpoint
    ? `${URL_GRAPHQL_PREFIX}/${project.name}`
    : project.graphQLEndpointURL;

  return createNetworkInterface({
    uri: graphQLEndpointURL,
    opts: {
      credentials: process.env.NODE_ENV === 'development'
        ? 'include'
        : 'same-origin',
    },
  });
};

/**
 *
 * @param {Object} queryResult
 * @return {boolean}
 */
export const queryResultHasData = queryResult =>
  Object.keys(queryResult).length > 10; // TODO: Better check
