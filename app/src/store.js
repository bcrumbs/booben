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

const enhancer = compose(...enhancers);
const store = createStore(rootReducer, enhancer);
const originalDispatch = store.dispatch;
let dispatchWithApollo = null;
let dispatch = originalDispatch;
let isApolloInjected = false;
let wasApolloInjected = false;

export const removeApolloMiddleware = () => {
  dispatchWithApollo = null;
  isApolloInjected = false;
};

export const injectApolloMiddleware = middleware => {
  if (isApolloInjected) removeApolloMiddleware();
  
  // https://github.com/reactjs/redux/blob/master/src/applyMiddleware.js
  const middlewareAPI = {
    getState: store.getState,
    dispatch: action => dispatch(action),
  };

  dispatchWithApollo = middleware(middlewareAPI)(originalDispatch);

  if (!wasApolloInjected) {
    store.dispatch = dispatch = action => (dispatchWithApollo !== null)
      ? dispatchWithApollo(action)
      : originalDispatch(action);

    wasApolloInjected = true;
  }

  isApolloInjected = true;
};

export default store;
