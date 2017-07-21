/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { ThemeProvider } from 'styled-components';
import { Theme, injectGlobalStyle } from '@reactackle/reactackle';
import { jssyTheme, reactackleMixin } from '@jssy/common-theme';
import { Preview } from './containers/Preview/Preview';
import { ErrorScreen } from './components/StateScreen/StateScreen';
import { projectToImmutable } from './models/Project';
import { loadComponents } from './lib/react-components';
import { removeSplashScreen } from './lib/dom';
import { getProject, getMetadata, getGraphQLSchema } from './lib/api';
import { transformMetadata, getContainerStyle } from './lib/meta';
import { parseGraphQLSchema } from './lib/schema';

import {
  applyJWTMiddleware,
  createNetworkInterfaceForProject,
} from './lib/apollo';

import { trimArray } from './utils/misc';

const getProjectName = () => {
  const pathSplit = trimArray(window.location.pathname.split('/'));
  
  return pathSplit.length === 2 // /preview/:project_name
    ? pathSplit[1]
    : '';
};

const createApolloClient = project => {
  const networkInterface = createNetworkInterfaceForProject(project);

  if (project.auth) {
    if (project.auth.type === 'jwt') {
      applyJWTMiddleware(
        networkInterface,
        () => localStorage.getItem('jssy_auth_token'),
      );
    }
  }

  return new ApolloClient({ networkInterface });
};

window.addEventListener('DOMContentLoaded', async () => {
  const containerElement =
    window.document.getElementById('__jssy_preview_container__');

  try {
    const projectName = getProjectName();
  
    if (projectName === '') {
      throw new Error('Invalid URL');
    }
    
    const [rawProject, rawMeta] = await Promise.all([
      getProject(projectName),
      getMetadata(projectName),
      loadComponents(window, projectName),
    ]);
    
    const project = projectToImmutable(rawProject);
    const meta = transformMetadata(rawMeta);
    const containerStyle = getContainerStyle(meta);
    
    let content;
    
    if (project.graphQLEndpointURL) {
      const apolloClient = createApolloClient(project);
      const schema = parseGraphQLSchema(
        await getGraphQLSchema(project.graphQLEndpointURL),
      );
      
      content = (
        <ApolloProvider client={apolloClient}>
          <Preview
            project={project}
            meta={meta}
            schema={schema}
          />
        </ApolloProvider>
      );
    } else {
      content = (
        <Preview
          project={project}
          meta={meta}
        />
      );
    }

    ReactDOM.render(content, containerElement, () => {
      containerElement.setAttribute('style', containerStyle);
      removeSplashScreen();
    });
  } catch (err) {
    injectGlobalStyle();
    
    ReactDOM.render(
      <Theme mixin={reactackleMixin}>
        <ThemeProvider theme={jssyTheme}>
          <ErrorScreen
            title="Failed to load project"
            message={err.message}
          />
        </ThemeProvider>
      </Theme>,

      containerElement,
      removeSplashScreen,
    );
  }
});
