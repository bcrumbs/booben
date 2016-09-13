/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import {
    NOT_LOADED,
    LOADING,
    LOADED,
    LOAD_ERROR
} from '../constants/loadStates';

import {
    PROJECT_REQUEST,
    PROJECT_LOADED,
    PROJECT_LOAD_FAILED
} from '../actions/project';

export default (state = {
    projectName: '',
    loadState: NOT_LOADED,
    data: null,
    meta: null,
    error: null
}, action) => {
    switch (action.type) {
        case PROJECT_REQUEST: return Object.assign({}, state, {
            projectName: action.projectName,
            loadState: LOADING
        });

        case PROJECT_LOADED: return Object.assign({}, state, {
            projectName: action.project.name,
            loadState: LOADED,
            data: action.project,
            meta: action.metadata,
            error: null
        });

        case PROJECT_LOAD_FAILED: return Object.assign({}, state, {
            loadState: LOAD_ERROR,
            data: null,
            error: action.error
        });

        default: return state;
    }
};
