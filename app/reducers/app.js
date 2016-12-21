/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import {
    APP_LOCALIZATION_LOADING,
    APP_LOCALIZATION_LOAD_SUCCESS,
    APP_LOCALIZATION_LOAD_FAILURE,
    APP_TOGGLE_CONTENT_PLACEHOLDERS,
    APP_TOGGLE_COMPONENT_TITLES,
} from '../actions/app';

import {
    NOT_LOADED,
    LOADING,
    LOADED,
    LOAD_ERROR,
} from '../constants/loadStates';

import { Record } from 'immutable';

const AppState = Record({
  language: 'en',
  localizationLoadState: NOT_LOADED,
  localizationLoadError: null,
  localization: {},
  showContentPlaceholders: false,
  showComponentTitles: false,
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
        localizationLoadState: LOADED,
      }).set(
        'localization', action.localization,
      );
    }

    case APP_TOGGLE_CONTENT_PLACEHOLDERS: {
      return state.set('showContentPlaceholders', action.enable);
    }

    case APP_TOGGLE_COMPONENT_TITLES: {
      return state.set('showComponentTitles', action.enable);
    }

    default:
      return state;
  }
};
