/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers';

const loggerMiddleware = createLogger();

const reduxDevtools = process.env.NODE_ENV === 'development' && window && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
export default createStore(
    rootReducer,
    compose(
      applyMiddleware(
          thunkMiddleware,
          loggerMiddleware
      ),
      reduxDevtools
    )
);
