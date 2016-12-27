/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import '@reactackle/reactackle/reactackle.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRedirect } from 'react-router';
import { Provider } from 'react-redux';

import AppRoute from './routes/AppRoute';
import RootRoute from './routes/RootRoute';
import StructureRoute, { STRUCTURE_TOOL_IDS } from './routes/StructureRoute';
import DesignRoute, { DESIGN_TOOL_IDS } from './routes/DesignRoute';
import PreviewRoute from './routes/PreviewRoute';

import PlaygroundRoute, { PLAYGROUND_TOOL_IDS } from './routes/PlaygroundRoute';

import store from './store';
import history from './history';

import { setTools } from './actions/desktop';
import { setCurrentRoute } from './actions/preview';
import { loadLocalization } from './actions/app';

const setToolsOnEnter = toolIds => () => void store.dispatch(setTools(toolIds));

const onDesignRouteEnter = ({ location, params }) => {
  const routeId = Number(params.routeId),
    isIndexRoute = location.pathname.endsWith('/index');

  store.dispatch(setCurrentRoute(routeId, isIndexRoute));
  store.dispatch(setTools(DESIGN_TOOL_IDS));
};

/*
 * Testing
 */
window.abc = lang => store.dispatch(loadLocalization(lang));

store.dispatch(loadLocalization('en'));

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <Route
          path="/playground"
          component={PlaygroundRoute}
          onEnter={setToolsOnEnter(PLAYGROUND_TOOL_IDS)}
        />

        <Route path="/:projectName" component={AppRoute}>
          <Route component={RootRoute}>
            <IndexRedirect to="/:projectName/structure" />

            <Route
              path="structure"
              component={StructureRoute}
              onEnter={setToolsOnEnter(STRUCTURE_TOOL_IDS)}
            />

            <Route
              path="design/:routeId(/index)"
              component={DesignRoute}
              onEnter={onDesignRouteEnter}
            />
          </Route>

          <Route
            path="preview"
            component={PreviewRoute}
          />
        </Route>
      </Router>
    </Provider>,

    document.getElementById('container'),
  );
});
