/**
 * @author Dmitriy Bizyaev
 */

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { URL_GRAPHQL_PREFIX } from '../../../shared/constants';

export const createApolloClient = project => {
  const graphQLEndpointURL = project.proxyGraphQLEndpoint
    ? `${URL_GRAPHQL_PREFIX}/${project.name}`
    : project.graphQLEndpointURL;

  const httpLink = createHttpLink({
    uri: graphQLEndpointURL,
    credentials: 'same-origin',
  });

  const middlewareLink = setContext(() => ({
    headers: {
      authorization: localStorage.getItem('jssy_auth_token') || null,
    },
  }));

  const link = middlewareLink.concat(httpLink);

  const cache = new InMemoryCache({
    
  });

  return new ApolloClient({
    link,
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
