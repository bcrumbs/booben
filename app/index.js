/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, useRouterHistory, IndexRedirect } from 'react-router';
import { createHistory } from 'history';

import RootRoute from './routes/RootRoute';
import StructureRoute from './routes/StructureRoute';
import DesignRoute from './routes/DesignRoute';

import '@reactackle/reactackle/reactackle.scss';

const history = useRouterHistory(createHistory)({
    basename: '/app'
});

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Router history={history}>
            <Route path="/:projectName" component={RootRoute}>
                <IndexRedirect to="/:projectName/structure" />
                <Route path="structure" component={StructureRoute}/>
                <Route path="design/:routeId" component={DesignRoute}/>
            </Route>
        </Router>,

        document.getElementById('container')
    );
});
