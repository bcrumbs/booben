/**
 * @author Dmitriy Bizyaev
 */

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import app from './app';
import project from './project';
import desktop from './desktop';
import componentsLibrary from './components-library';

const reducers = {
  app,
  project,
  desktop,
  componentsLibrary,
  router: routerReducer,
};

export default combineReducers({ ...reducers });

export const createReducer = (additionalReducers = {}) => combineReducers({
  ...reducers,
  ...additionalReducers,
});
