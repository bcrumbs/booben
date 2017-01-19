/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record } from 'immutable';

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

const AppState = Record({
  language: 'en',
  localizationLoadState: NOT_LOADED,
  localizationLoadError: null,
  localization: {},
  showContentPlaceholders: false,
  showComponentTitles: false,
});

const handlers = {
  [APP_LOCALIZATION_LOADING]: state =>
    state.set('localizationLoadState', LOADING),
  
  [APP_LOCALIZATION_LOAD_FAILURE]: (state, action) => state.merge({
    localizationLoadState: LOAD_ERROR,
    localizationLoadError: action.error,
  }),
  
  [APP_LOCALIZATION_LOAD_SUCCESS]: (state, action) => state
    .merge({
      language: action.language,
      localizationLoadState: LOADED,
    })
    .set('localization', action.localization),
  
  [APP_TOGGLE_CONTENT_PLACEHOLDERS]: (state, action) =>
    state.set('showContentPlaceholders', action.enable),
  
  [APP_TOGGLE_COMPONENT_TITLES]: (state, action) =>
    state.set('showComponentTitles', action.enable),
};

export default (state = new AppState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
