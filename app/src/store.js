/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { enableBatching } from 'redux-batched-actions';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from './reducers';
import history from './history';

const middleware = [routerMiddleware(history), thunkMiddleware];

if (process.env.NODE_ENV === 'development')
  middleware.push(createLogger());

const enhancers = [
  applyMiddleware(...middleware),
];

//noinspection JSUnresolvedVariable
const willAddReduxDevTools =
    process.env.NODE_ENV === 'development' &&
    window &&
    window.__REDUX_DEVTOOLS_EXTENSION__;

if (willAddReduxDevTools) {
  //noinspection JSUnresolvedFunction
  enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

const reducer = enableBatching(rootReducer);
const enhancer = compose(...enhancers);

export default createStore(reducer, enhancer);
