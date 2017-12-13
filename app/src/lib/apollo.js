/**
 * @author Dmitriy Bizyaev
 */

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { URL_GRAPHQL_PREFIX } from '../../../shared/constants';

/**
 * @typedef {Object} AuthConfigJWT
 * @property {function(): string} getToken
 */

/**
 * @typedef {AuthConfigJWT} AuthConfig
 */

/**
 *
 * @param {Object} project
 * @param {?AuthConfig} authConfig
 * @return {ApolloClient}
 */
export const createApolloClient = (project, authConfig) => {
  const graphQLEndpointURL = project.proxyGraphQLEndpoint
    ? `${URL_GRAPHQL_PREFIX}/${project.name}`
    : project.graphQLEndpointURL;

  let link = createHttpLink({
    uri: graphQLEndpointURL,
    credentials: 'same-origin',
  });

  const cache = new InMemoryCache();

  if (project.auth) {
    if (project.auth.type === 'jwt') {
      const middlewareLink = setContext(() => ({
        headers: {
          authorization: authConfig.getToken(),
        },
      }));

      link = middlewareLink.concat(link);
    }
  }

  return new ApolloClient({ link, cache });
};

/**
 *
 * @param {Object} queryResult
 * @return {boolean}
 */
export const queryResultHasData = queryResult =>
  Object.keys(queryResult).length > 10; // TODO: Better check
