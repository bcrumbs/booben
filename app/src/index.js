/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import '@reactackle/reactackle/reactackle.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, Redirect } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { Theme, injectGlobalStyle } from '@reactackle/reactackle';
import { jssyTheme, reactackleMixin } from '@jssy/common-theme';
import RootRoute from './routes/RootRoute';
import PlaygroundRoute from './routes/PlaygroundRoute';
import store from './store';
import history from './history';

import {
  ShortcutsProvider,
} from './containers/ShortcutsProvider/ShortcutsProvider';

import keymap from './keymap';
import { loadStrings } from './actions/app';
import { PATH_ROOT, buildStructurePath } from './constants/paths';
import { DEFAULT_LANGUAGE } from './config';
import './styles/classUtils.css';

injectGlobalStyle();

store.dispatch(loadStrings(DEFAULT_LANGUAGE));

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Theme mixin={reactackleMixin}>
      <ThemeProvider theme={jssyTheme}>
        <Provider store={store}>
          <ShortcutsProvider keymap={keymap}>
            <ConnectedRouter history={history}>
              <Switch>
                <Route
                  exact
                  path="/playground"
                  component={PlaygroundRoute}
                />
    
                <Route
                  exact
                  path={PATH_ROOT}
                  render={({ match }) => (
                    <Redirect to={buildStructurePath(match.params)} />
                  )}
                />
    
                <Route path={PATH_ROOT} component={RootRoute} />
              </Switch>
            </ConnectedRouter>
          </ShortcutsProvider>
        </Provider>
      </ThemeProvider>
    </Theme>,

    window.document.getElementById('container'),
  );
});
