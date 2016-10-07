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
import structure from './structure';
import design from './design';

export default combineReducers({
    app,
    project,
    preview,
    desktop,
    componentsLibrary,
    structure,
    design
});
