/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { introspectionQuery } from 'graphql/utilities';
import { URL_API_PREFIX } from '../../shared/constants';

/**
 *
 * @param {string} projectName
 * @return {Project}
 */
export const getProject = async projectName => {
  const res = await fetch(`${URL_API_PREFIX}/projects/${projectName}`);
  const data = await res.json();
  
  if (data.error) throw new Error(data.error);
  return data;
};


/**
 *
 * @param {string} projectName
 * @return {Object<string, Object<string, ComponentMeta>>}
 */
export const getMetadata = async projectName => {
  const res = await fetch(`${URL_API_PREFIX}/projects/${projectName}/metadata`);
  const data = await res.json();
  
  if (data.error) throw new Error(data.error);
  return data;
};

/**
 *
 * @param {string} language
 * @return {Object<string, string>}
 */
export const getLocalization = async language => {
  const res = await fetch(`localization/${language}.json`);
  const data = await res.json();
  
  if (data.error) throw new Error(data.error);
  return data;
};

/**
 *
 * @param {string} graphqlEndpointURL
 * @return {GQLSchema}
 */
export const getGraphQLSchema = async graphqlEndpointURL => {
  const res = await fetch(graphqlEndpointURL, {
    method: 'POST',
    body: JSON.stringify({ query: introspectionQuery }),
    headers: {
      'content-type': 'application/json',
    },
  });
  
  const data = await res.json();
  
  if (data.error) throw new Error(data.error);
  return data.data.__schema;
};
