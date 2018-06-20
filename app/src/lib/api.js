import Cookie from 'js-cookie';
import { introspectionQuery } from 'graphql/utilities';
import { URL_API_PREFIX } from '../../../shared/constants';

/**
 *
 * @param {string} projectName
 * @return {Project}
 */
export const getProject = async projectName => {
  const url = URL_API_PREFIX;
  const jwt = Cookie.getJSON('booben-jwt');

  const res = await fetch(`${url}/projects/${projectName}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  if (data.message) throw new Error(data.message);
  return data;
};

/**
 *
 * @param {string} projectName
 * @param {Project} project
 * @return {Object}
 */
export const putProject = async (projectName, project) => {
  const url = URL_API_PREFIX;
  const res = await fetch(`${url}/projects/${projectName}`, {
    method: 'PUT',
    body: JSON.stringify(project),
    headers: {
      'content-type': 'application/json',
    },
  });
    
  const data = await res.json();
  
  if (data.error) throw new Error(data.error);
  if (data.message) throw new Error(data.message);
  return data;
};

/**
 *
 * @param {string} projectName
 * @return {Object<string, Object<string, ComponentMeta>>}
 */
export const getMetadata = async projectName => {
  const url = `${URL_API_PREFIX}/projects/${projectName}/metadata`;

  const res = await fetch(url);
  const data = await res.json();
  
  if (data.error) throw new Error(data.error);
  return data;
};

/**
 *
 * @param {string} language
 * @return {Object<string, string>}
 */
export const getStrings = async language => {
  const res = await fetch(`/strings/${language}.json`);
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

export const getCode = async (project, meta) => {
  const url = `${URL_API_PREFIX}/codegen`;

  const body = {
    project,
    meta,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const data = await res.blob()
    if (data.error) throw new Error(data.error);
    return data  
  } else {
    throw new Error(res.status);
  }
  
}
