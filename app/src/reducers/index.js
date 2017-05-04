/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import app from './app';
import project from './project';
import desktop from './desktop';
import componentsLibrary from './components-library';

export default combineReducers({
  app,
  project,
  desktop,
  componentsLibrary,
  router: routerReducer,
});
