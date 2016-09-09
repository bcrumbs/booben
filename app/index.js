/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, useRouterHistory } from 'react-router';
import { createHistory } from 'history'

import RootRoute from './routes/Root';
import '@reactackle/reactackle/reactackle.scss';

const history = useRouterHistory(createHistory)({
    basename: '/app'
});

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Router history={history}>
            <Route path='/:projectName' component={RootRoute}/>
        </Router>,

        document.getElementById('container')
    );
});
