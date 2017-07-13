/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { Preview } from './containers/Preview/Preview';
import { ErrorScreen } from './components/StateScreen/StateScreen';
import store, { injectApolloMiddleware } from './store';
import { createReducer } from './reducers';
import { containerStyleSelector } from './selectors';
import { loadComponents } from './lib/react-components';
import { loadProject } from './actions/project';
import { removeSplashScreen } from './lib/dom';

import {
  applyJWTMiddleware,
  createNetworkInterfaceForProject,
} from './lib/apollo';

import { LOADED, LOAD_ERROR } from './constants/load-states';
import { APOLLO_STATE_KEY } from './constants/misc';

const getProjectName = () => {
  const pathSplit = window.location.pathname.split('/');
  return pathSplit.length > 0 ? pathSplit[pathSplit.length - 1] : '';
};

const waitForProject = projectName => new Promise((resolve, reject) => {
  if (!projectName) {
    reject(new Error('Project name not specified'));
    return;
  }

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    const loadState = state.project.loadState;

    if (loadState === LOADED) {
      unsubscribe();
      resolve(state.project.data);
    } else if (loadState === LOAD_ERROR) {
      unsubscribe();
      reject(state.project.error);
    }
  });

  store.dispatch(loadProject(projectName));
});

const getProvider = project => {
  if (!project.graphQLEndpointURL) {
    return {
      ProviderComponent: Provider,
      providerProps: { store },
    };
  }

  const networkInterface = createNetworkInterfaceForProject(project);

  if (project.auth) {
    if (project.auth.type === 'jwt') {
      applyJWTMiddleware(
        networkInterface,
        () => localStorage.getItem('jssy_auth_token'),
      );
    }
  }

  const client = new ApolloClient({
    networkInterface,
    reduxRootSelector: state => state[APOLLO_STATE_KEY],
  });

  const apolloReducer = client.reducer();
  const apolloMiddleware = client.middleware();

  store.replaceReducer(createReducer({
    [APOLLO_STATE_KEY]: apolloReducer,
  }));

  injectApolloMiddleware(apolloMiddleware);

  return {
    ProviderComponent: ApolloProvider,
    providerProps: { client, store },
  };
};

window.addEventListener('DOMContentLoaded', async () => {
  const projectName = getProjectName();
  const containerElement =
    window.document.getElementById('__jssy_preview_container__');

  try {
    const [project] = await Promise.all([
      waitForProject(projectName),
      loadComponents(window, projectName),
    ]);

    const { ProviderComponent, providerProps } = getProvider(project);

    const state = store.getState();
    const containerStyle = containerStyleSelector(state);
    containerElement.setAttribute('style', containerStyle);

    ReactDOM.render(
      <ProviderComponent {...providerProps}>
        <Preview />
      </ProviderComponent>,

      containerElement,
      removeSplashScreen,
    );
  } catch (err) {
    ReactDOM.render(
      <ErrorScreen
        title="Failed to load project"
        message={err.message}
      />,

      containerElement,
      removeSplashScreen,
    );
  }
});
