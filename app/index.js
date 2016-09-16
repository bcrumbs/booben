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

import Playground from './components/Playground';

import store from './store';

const history = useRouterHistory(createHistory)({
    basename: '/app'
});

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Provider store={store}>
            <Router history={history}>
                <Route path="/:projectName" component={AppRoute}>
                    <Route component={RootRoute}>
                        <IndexRedirect to="/:projectName/structure" />
                        <Route path="structure" component={StructureRoute}/>
                        <Route path="design/:routeId" component={DesignRoute}/>
                    </Route>
                    <Route path="preview" component={PreviewRoute}/>
                </Route>
            </Router>
        </Provider>,

        document.getElementById('container')
    );
});
