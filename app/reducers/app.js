/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import {
    APP_LOCALIZATION_LOADING,
    APP_LOCALIZATION_LOAD_SUCCESS,
    APP_LOCALIZATION_LOAD_FAILURE
} from '../actions/app';

import {
    NOT_LOADED,
    LOADING,
    LOADED,
    LOAD_ERROR
} from '../constants/loadStates';

import { Record } from 'immutable';

const AppState = Record({
    language: 'en',
    localizationLoadState: NOT_LOADED,
    localizationLoadError: null,
    localization: {},
});

export default (state = new AppState(), action) => {
    switch (action.type) {
        case APP_LOCALIZATION_LOADING: {
            return state.set('localizationLoadState', LOADING);
        }

        case APP_LOCALIZATION_LOAD_FAILURE: {
            return state.merge({
                localizationLoadState: LOAD_ERROR,
                localizationLoadError: action.error,
            });
        }

        case APP_LOCALIZATION_LOAD_SUCCESS: {
            return state.merge({
                language: action.language,
                localization: action.localization,
                localizationLoadState: LOADED
            });
        }

        default:
            return state;
    }
};
