/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { combineReducers } from 'redux';

import project from './project';
import preview from './preview';

export default combineReducers({
    project,
    preview
});
