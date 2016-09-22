/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import '@reactackle/reactackle/reactackle.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, useRouterHistory, IndexRedirect } from 'react-router';
import { createHistory } from 'history';
import { Provider } from 'react-redux';

import AppRoute from './routes/AppRoute';
import RootRoute from './routes/RootRoute';
import StructureRoute from './routes/StructureRoute';
import DesignRoute from './routes/DesignRoute';
import PreviewRoute from './routes/PreviewRoute';

import PlaygroundRoute from './routes/PlaygroundRoute';

import store from './store';

import { setTools } from './actions/desktop';

import playgroundRouteTools from './tools/playground';
import structureRouteTools from './tools/structure';
import designRouteTools from './tools/design';

const history = useRouterHistory(createHistory)({
    basename: '/app'
});

const setToolsOnEnter = tools => () => void store.dispatch(setTools(tools));

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Provider store={store}>
            <Router history={history}>
                <Route
                    path="/playground"
                    component={PlaygroundRoute}
                    onEnter={setToolsOnEnter(playgroundRouteTools)}
                />
                
                <Route path="/:projectName" component={AppRoute}>
                    <Route component={RootRoute}>
                        <IndexRedirect to="/:projectName/structure" />

                        <Route
                            path="structure"
                            component={StructureRoute}
                            onEnter={setToolsOnEnter(structureRouteTools)}
                        />

                        <Route
                            path="design/:routeId"
                            component={DesignRoute}
                            onEnter={setToolsOnEnter(designRouteTools)}
                        />
                    </Route>
                    <Route path="preview" component={PreviewRoute}/>
                </Route>
            </Router>
        </Provider>,

        document.getElementById('container')
    );
});
