import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ThemeProvider } from 'styled-components';
import { parseGraphQLSchema } from 'booben-graphql-schema';
import { Theme, injectGlobalStyle } from 'reactackle-core';
import { boobenTheme, reactackleMixin } from './styles/theme';
import { Preview } from './containers/Preview/Preview';
import { ErrorScreen } from './components/StateScreen/StateScreen';
import { projectToImmutable } from './models/Project';
import ComponentsBundle from './lib/ComponentsBundle';
import { removeSplashScreen } from './lib/dom';
import { getProject, getMetadata, getGraphQLSchema } from './lib/api';
import { transformMetadata, getContainerStyle } from './lib/meta';
import { createApolloClient } from './lib/apollo';
import { trimArray } from './utils/misc';
import fakeSchema from './actions/helpers/fakeSchema.json';

const getProjectName = () => {
  const pathSplit = trimArray(window.location.pathname.split('/'));

  return pathSplit.length === 2 // /preview/:project_name
    ? pathSplit[1]
    : '';
};

/**
 *
 * @param {Object} projectAuth
 * @return {?AuthConfig}
 */
const getAuthConfig = projectAuth => {
  if (projectAuth === null) {
    return null;
  }

  switch (projectAuth.type) {
    case 'jwt': {
      return {
        getToken: () => localStorage.getItem('booben_auth_token'),
      };
    }

    default: {
      return null;
    }
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  const containerElement =
    window.document.getElementById('__booben_preview_container__');

  try {
    const projectName = getProjectName();

    if (projectName === '') {
      throw new Error('Invalid URL');
    }

    const componentsBundle = new ComponentsBundle(projectName, window);
    const [rawProject, rawMeta] = await Promise.all([
      getProject(projectName),
      getMetadata(projectName),
      componentsBundle.loadComponents(),
    ]);

    const project = projectToImmutable(rawProject);
    const meta = transformMetadata(rawMeta);
    const containerStyle = getContainerStyle(meta);

    let content;

    if (project.graphQLEndpointURL) {
      const apolloClient = createApolloClient(
        project,
        getAuthConfig(project.auth),
      );

      const rawSchema = await getGraphQLSchema(project.graphQLEndpointURL);
      const schema = parseGraphQLSchema(rawSchema);

      content = (
        <ApolloProvider client={apolloClient}>
          <Preview
            componentsBundle={componentsBundle}
            project={project}
            meta={meta}
            schema={schema}
          />
        </ApolloProvider>
      );
    } else {
      content = (
        <Preview
          componentsBundle={componentsBundle}
          project={project}
          meta={meta}
          schema={fakeSchema}
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
        <ThemeProvider theme={boobenTheme}>
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
