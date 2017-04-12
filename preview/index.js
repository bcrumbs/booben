'use strict';

import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { loadComponents } from './componentsLibrary';
import Preview from './containers/Preview';
import Overlay from './containers/Overlay';

import {
  PREVIEW_DOM_CONTAINER_ID,
  PREVIEW_DOM_OVERLAY_ID,
} from '../shared/constants';

import { LOADED } from '../app/constants/loadStates';

window.JSSY = {
  initializing: false,
  initialized: false,
  params: null,
};

/**
 * Load components bundle, then mount Preview and Overlay
 *
 * @param {Object} params
 * @param {Object} params.store
 * @param {boolean} params.interactive
 * @param {string} params.containerStyle
 * @return {Promise}
 */
window.JSSY.initPreview = params => {
  if (window.JSSY.initialized) return Promise.resolve();
  window.JSSY.initializing = true;

  return loadComponents()
    .then(() => {
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

        if (state.project.data.auth) {
          if (state.project.data.auth.type === 'jwt') {
            networkInterface.use([{
              applyMiddleware(req, next) {
                if (!req.options.headers) req.options.headers = {};
                const token = localStorage.getItem('jssy_auth_token');

                if (token)
                  req.options.headers.Authorization = `Bearer ${token}`;

                next();
              },
            }]);
          }
        }

        const client = new ApolloClient({ networkInterface });

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
    });
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
