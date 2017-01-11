/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { combineReducers } from 'redux';
import app from './app';
import project from './project';
import desktop from './desktop';
import componentsLibrary from './components-library';
import design from './design';

export default combineReducers({
  app,
  project,
  desktop,
  componentsLibrary,
  design,
});
