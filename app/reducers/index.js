/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { combineReducers } from 'redux';

import project from './project';
import preview from './preview';
import desktop from './desktop';

export default combineReducers({
    project,
    preview,
    desktop
});
