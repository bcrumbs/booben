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

const reducer = enableBatching(rootReducer);
const enhancer = compose(...enhancers);
const store = createStore(reducer, enhancer);
const originalDispatch = store.dispatch;
let dispatch = originalDispatch;
let isApolloInjected = false;

export const removeApolloMiddleware = () => {
  store.dispatch = originalDispatch;
  dispatch = originalDispatch;
  isApolloInjected = false;
};

export const injectApolloMiddleware = middleware => {
  if (isApolloInjected) removeApolloMiddleware();
  
  // https://github.com/reactjs/redux/blob/master/src/applyMiddleware.js
  const middlewareAPI = {
    getState: store.getState,
    dispatch: action => dispatch(action),
  };
  
  store.dispatch = dispatch = middleware(middlewareAPI)(originalDispatch);
  isApolloInjected = true;
};

export default store;
