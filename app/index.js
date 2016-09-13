/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import '@reactackle/reactackle/reactackle.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, useRouterHistory, IndexRedirect } from 'react-router';
import { createHistory } from 'history';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';

import RootRoute from './routes/RootRoute';
import StructureRoute from './routes/StructureRoute';
import DesignRoute from './routes/DesignRoute';

import rootReducer from './reducers';

const history = useRouterHistory(createHistory)({
    basename: '/app'
});

const loggerMiddleware = createLogger();

const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Provider store={store}>
            <Router history={history}>
                <Route path="/:projectName" component={RootRoute}>
                    <IndexRedirect to="/:projectName/structure" />
                    <Route path="structure" component={StructureRoute}/>
                    <Route path="design/:routeId" component={DesignRoute}/>
                </Route>
            </Router>
        </Provider>,

        document.getElementById('container')
    );
});
