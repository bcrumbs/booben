/**
 * @author Dmitriy Bizyaev
 */

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { URL_GRAPHQL_PREFIX } from '../../../shared/constants';

export const createApolloClient = (project, authConfig) => {
  const graphQLEndpointURL = project.proxyGraphQLEndpoint
    ? `${URL_GRAPHQL_PREFIX}/${project.name}`
    : project.graphQLEndpointURL;

  const httpLink = createHttpLink({
    uri: graphQLEndpointURL,
    credentials: 'same-origin',
  });

  const cache = new InMemoryCache();

  if (authConfig.type === 'jwt') {
    const middlewareLink = setContext(() => ({
      headers: {
        authorization: authConfig.getToken(),
      },
    }));

    const link = middlewareLink.concat(httpLink);
    
    return new ApolloClient({
      link,
      cache,
    });
  }
  return new ApolloClient({
    httpLink,
    cache,
  });
};

/**
 *
 * @param {Object} queryResult
 * @return {boolean}
 */
export const queryResultHasData = queryResult =>
  Object.keys(queryResult).length > 10; // TODO: Better check
