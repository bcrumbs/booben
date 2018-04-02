import Cookie from 'js-cookie';
import { introspectionQuery } from 'graphql/utilities';
import { URL_API_PREFIX } from '../../../shared/constants';

const backendUrl =
      'https://nr0pmvrpw6.execute-api.eu-central-1.amazonaws.com/production';

/**
 *
 * @param {string} projectName
 * @return {Project}
 */
export const getProject = async projectName => {
  let url = URL_API_PREFIX;
  const jwt = Cookie.getJSON('jssy-jwt');
  console.log('jwt', jwt)
  if (process.env.NODE_ENV === 'production') {
    url = backendUrl;
  }

  const res = await fetch(`${url}/projects/${projectName}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data = await res.json();

  if (data.error) throw new Error(data.error);
  return data;
};

/**
 *
 * @param {string} projectName
 * @param {Project} project
 * @return {Object}
 */
export const putProject = async (projectName, project) => {

  let url = URL_API_PREFIX;

  if (process.env.NODE_ENV === 'production') {
    url = backendUrl;
    const jwt = Cookie.getJSON('jssy-jwt');

    const res = await fetch(`${url}/projects/${projectName}`, {
      method: 'POST',
      body: JSON.stringify(project),
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    
    const data = await res.json();
  
    if (data.error) throw new Error(data.error);
    return data;
  } else {
    const res = await fetch(`${url}/projects/${projectName}`, {
      method: 'PUT',
      body: JSON.stringify(project),
      headers: {
        'content-type': 'application/json',
      },
    });
    
    const data = await res.json();
  
    if (data.error) throw new Error(data.error);
    return data;
  }
};

/**
 *
 * @param {string} projectName
 * @return {Object<string, Object<string, ComponentMeta>>}
 */
export const getMetadata = async projectName => {
  let url = `${URL_API_PREFIX}/projects/${projectName}/metadata`;

  if (process.env.NODE_ENV === 'production') {
    url = 'https://s3.eu-central-1.amazonaws.com/jssy-meta/meta.json';
  }

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
