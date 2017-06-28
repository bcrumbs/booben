/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record } from 'immutable';

import {
  APP_LOAD_STRINGS,
  APP_LOAD_STRINGS_SUCCESS,
  APP_LOAD_STRINGS_FAILURE,
  APP_TOGGLE_CONTENT_PLACEHOLDERS,
  APP_TOGGLE_COMPONENT_TITLES,
  APP_SHOW_FOOTER_TOGGLES,
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
  showFooterToggles: false,
  showContentPlaceholders: false,
});

const handlers = {
  [APP_LOAD_STRINGS]: state =>
    state.set('localizationLoadState', LOADING),
  
  [APP_LOAD_STRINGS_FAILURE]: (state, action) => state.merge({
    localizationLoadState: LOAD_ERROR,
    localizationLoadError: action.error,
  }),
  
  [APP_LOAD_STRINGS_SUCCESS]: (state, action) => state
    .merge({
      language: action.language,
      localizationLoadState: LOADED,
    })
    .set('localization', action.localization),
  
  [APP_TOGGLE_CONTENT_PLACEHOLDERS]: (state, action) =>
    state.set('showContentPlaceholders', action.enable),
  
  [APP_SHOW_FOOTER_TOGGLES]: (state, action) =>
    state.set('showFooterToggles', action.show),
};

export default (state = new AppState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
