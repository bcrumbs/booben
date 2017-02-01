/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers';

const middleware = [thunkMiddleware];

if (process.env.NODE_ENV === 'development')
  middleware.push(createLogger());

const fns = [
  applyMiddleware(...middleware),
];

//noinspection JSUnresolvedVariable
const willAddReduxDevTools =
    process.env.NODE_ENV === 'development' &&
    window &&
    window.__REDUX_DEVTOOLS_EXTENSION__;

if (willAddReduxDevTools) {
  //noinspection JSUnresolvedFunction
  fns.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

export default createStore(rootReducer, compose(...fns));
