/**
 * @author Dmitriy Bizyaev
 */

import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from './reducers';
import history from './history';

const middleware = [routerMiddleware(history), thunkMiddleware];

if (process.env.NODE_ENV === 'development') {
  middleware.push(createLogger());
}

const enhancers = [
  applyMiddleware(...middleware),
];

const willAddReduxDevTools =
  process.env.NODE_ENV === 'development' &&
  window &&
  window.__REDUX_DEVTOOLS_EXTENSION__;

if (willAddReduxDevTools) {
  enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

export default createStore(rootReducer, compose(...enhancers));
