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

import PlaygroundRoute from './routes/PlaygroundRoute';

import store from './store';
import history from './history';

import { setTools } from './actions/desktop';

import playgroundRouteTools from './tools/playground';

import { List } from 'immutable';

const setToolsOnEnter = toolIds => () => void store.dispatch(setTools(toolIds));

const playgroundToolIds = [];
playgroundRouteTools.forEach(group =>
    void group.forEach(tool =>
        void playgroundToolIds.push(tool.id)));

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Provider store={store}>
            <Router history={history}>
                <Route
                    path="/playground"
                    component={PlaygroundRoute}
                    onEnter={setToolsOnEnter(List(playgroundToolIds))}
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
                            onEnter={setToolsOnEnter(DESIGN_TOOL_IDS)}
                        />
                    </Route>

                    <Route
                        path="preview"
                        component={PreviewRoute}
                    />
                </Route>
            </Router>
        </Provider>,

        document.getElementById('container')
    );
});
