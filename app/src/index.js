/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import '@reactackle/reactackle/reactackle.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import RootRoute from './routes/RootRoute';
import PlaygroundRoute, { PLAYGROUND_TOOL_IDS } from './routes/PlaygroundRoute';
import store from './store';
import { setTools } from './actions/desktop';
import { loadLocalization } from './actions/app';

const onPlaygroundRouteEnter = () => {
  store.dispatch(setTools(PLAYGROUND_TOOL_IDS));
};

store.dispatch(loadLocalization('en'));

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter basename="/app">
        <Switch>
          <Route
            path="/playground"
            component={PlaygroundRoute}
            onEnter={onPlaygroundRouteEnter}
          />
          
          <Route
            exact
            path="/:projectName"
            render={({ match }) => (
              <Redirect to={`/${match.params.projectName}/structure`} />
            )}
          />
  
          <Route path="/:projectName" component={RootRoute} />
        </Switch>
      </BrowserRouter>
    </Provider>,

    window.document.getElementById('container'),
  );
});
