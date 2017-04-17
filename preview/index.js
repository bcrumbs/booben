'use strict';

import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import _set from 'lodash.set';
import _get from 'lodash.get';
import { loadComponents } from './componentsLibrary';
import Preview from './containers/Preview';
import Overlay from './containers/Overlay';

import {
  PREVIEW_DOM_CONTAINER_ID,
  PREVIEW_DOM_OVERLAY_ID,
} from '../shared/constants';

import { LOADED } from '../app/constants/loadStates';
import { buildMutation } from '../app/utils/graphql';

window.JSSY = {
  initializing: false,
  initialized: false,
  params: null,
};

const applyJWTMiddleware = (networkInterface, getToken) => {
  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) req.options.headers = {};
      const token = getToken();
      if (token) req.options.headers.Authorization = `Bearer ${token}`;
      next();
    },
  }]);
};

let token = null;
const getToken = () => token;

/**
 * Load components bundle, then mount Preview and Overlay
 *
 * @param {Object} params
 * @param {Object} params.store
 * @param {boolean} params.interactive
 * @param {string} params.containerStyle
 */
window.JSSY.initPreview = async params => {
  if (window.JSSY.initialized) return;
  window.JSSY.initializing = true;

  await loadComponents();
  
  const containerNode = document.getElementById(PREVIEW_DOM_CONTAINER_ID);
  const overlayNode = document.getElementById(PREVIEW_DOM_OVERLAY_ID);
  
  containerNode.setAttribute('style', params.containerStyle);
  
  const state = params.store.getState();
  
  if (state.project.loadState !== LOADED)
    throw new Error('initPreview() failed: project is not loaded');
  
  const graphQLEndpointURL = state.project.data.graphQLEndpointURL;
  
  let ProviderComponent;
  let providerProps;
  
  if (graphQLEndpointURL) {
    ProviderComponent = ApolloProvider;
    
    const networkInterface =
      createNetworkInterface({ uri: graphQLEndpointURL });
    
    const auth = state.project.data.auth;
    
    if (auth) {
      if (auth.type === 'jwt') {
        applyJWTMiddleware(
          networkInterface,
          !params.interactive
            ? getToken
            : () => localStorage.getItem('jssy_auth_token'),
        );
      }
    }
    
    const client = new ApolloClient({ networkInterface });
    
    if (params.interactive) {
      if (auth) {
        if (auth.type === 'jwt') {
          const schema = state.project.schema;
          const haveCredentials = !!auth.username && !!auth.password;
      
          if (schema && haveCredentials) {
            const selections = _set({}, auth.tokenPath, true);
            const mutation = buildMutation(
              schema,
              auth.loginMutation,
              selections,
            );
            
            const variables = {};
        
            _set(
              variables,
              [auth.username.argument, ...auth.username.path],
              auth.username.value,
            );
            
            _set(
              variables,
              [auth.password.argument, ...auth.password.path],
              auth.password.value,
            );
            
            try {
              const response = await client.mutate({ mutation, variables });
              
              token = _get(
                response.data,
                [auth.loginMutation, ...auth.tokenPath],
              );
            } catch (err) {
              token = null;
            }
          }
        }
      }
    }
    
    providerProps = {
      client,
      store: params.store,
    };
  } else {
    ProviderComponent = Provider;
    
    providerProps = {
      store: params.store,
    };
  }
  
  ReactDOM.render(
    <ProviderComponent {...providerProps}>
      <Preview interactive={params.interactive} />
    </ProviderComponent>,
    
    containerNode,
  );
  
  if (params.interactive) {
    ReactDOM.render(
      <ProviderComponent {...providerProps}>
        <Overlay />
      </ProviderComponent>,
      
      overlayNode,
    );
  }
  
  window.JSSY.initialized = true;
  window.JSSY.initializing = false;
  window.JSSY.params = params;
};

/**
 * Unmount everything
 */
window.JSSY.cleanup = () => {
  const { params, initialized } = window.JSSY;

  if (!initialized) return;

  const containerNode = document.getElementById(PREVIEW_DOM_CONTAINER_ID);
  const overlayNode = document.getElementById(PREVIEW_DOM_OVERLAY_ID);

  if (params.interactive) ReactDOM.unmountComponentAtNode(overlayNode);
  ReactDOM.unmountComponentAtNode(containerNode);

  window.JSSY.initialized = false;
  window.JSSY.params = null;
};
