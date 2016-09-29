/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { combineReducers } from 'redux';

import app from './app';
import project from './project';
import preview from './preview';
import desktop from './desktop';
import componentsLibrary from './components-library';

export default combineReducers({
    app,
    project,
    preview,
    desktop,
    componentsLibrary
});
