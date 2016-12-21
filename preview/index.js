'use strict';

import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import ApolloClient, { createNetworkInterface } from 'apollo-client';

import Preview from './containers/Preview';
import Overlay from './containers/Overlay';

import {
    PREVIEW_DOM_CONTAINER_ID,
    PREVIEW_DOM_OVERLAY_ID,
} from '../common/shared-constants';

import { LOADED } from '../app/constants/loadStates';


window.JSSY = {
  initialized: false,
  params: null,
};

/**
 * Rendering of preview
 *
 * @param {Object} params
 * @param {Object} params.store
 * @param {boolean} params.interactive
 * @param {string} params.containerStyle
 */
window.JSSY.initPreview = params => {
  if (window.JSSY.initialized) return;

  const containerNode = document.getElementById(PREVIEW_DOM_CONTAINER_ID),
    overlayNode = document.getElementById(PREVIEW_DOM_OVERLAY_ID);

  containerNode.setAttribute('style', params.containerStyle);

  const state = params.store.getState();

  if (state.project.loadState !== LOADED)
    throw new Error('initPreview() failed: project is not loaded');

  const graphQLEndpointURL = state.project.data.graphQLEndpointURL;

  let ProviderComponent,
    providerProps;

  if (graphQLEndpointURL) {
    ProviderComponent = ApolloProvider;

    const client = new ApolloClient({
      networkInterface: createNetworkInterface({ uri: graphQLEndpointURL }),
    });

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
  window.JSSY.params = params;
};

window.JSSY.cleanup = () => {
  const { params, initialized } = window.JSSY;

  if (!initialized) return;

  const containerNode = document.getElementById(PREVIEW_DOM_CONTAINER_ID),
    overlayNode = document.getElementById(PREVIEW_DOM_OVERLAY_ID);

  if (params.interactive)
    ReactDOM.unmountComponentAtNode(overlayNode);

  ReactDOM.unmountComponentAtNode(containerNode);

  window.JSSY.initialized = false;
  window.JSSY.params = null;
};
