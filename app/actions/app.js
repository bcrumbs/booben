/**
 * @author Oleg Nosov <olegnosov1@gmail.com>
 */

'use strict';

import { getLocalization } from '../api';

export const APP_LOCALIZATION_LOADING = 'APP_LOCALIZATION_LOADING';
export const APP_LOCALIZATION_LOAD_SUCCESS = 'APP_LOCALIZATION_LOAD_SUCCESS';
export const APP_LOCALIZATION_LOAD_FAILURE = 'APP_LOCALIZATION_LOAD_FAILURE';
export const APP_TOGGLE_CONTENT_PLACEHOLDERS = 'APP_TOGGLE_CONTENT_PLACEHOLDERS';
export const APP_TOGGLE_COMPONENT_TITLES = 'APP_TOGGLE_COMPONENT_TITLES';

/**
 *
 * @param {string} language
 * @param {Object} localization
 * @return {Object}
 */
export const localizationLoadSuccess = (language, localization) => ({
  type: APP_LOCALIZATION_LOAD_SUCCESS,
  language,
  localization,
});


/**
 * @param {string} error
 * @return {Object}
 */
export const localizationLoadFailure = error => ({
  type: APP_LOCALIZATION_LOAD_FAILURE,
  error,
});

/**
 * @return {Object}
 */
export const localizationLoading = () => ({
  type: APP_LOCALIZATION_LOADING,
});

/**
 * @param {string} language
 * @return {function(dispatch: function(action: Object))}
 */
export const loadLocalization = language => dispatch => {
  dispatch(localizationLoading());
  getLocalization(language)
        .then(localization => dispatch(localizationLoadSuccess(language, localization)))
        .catch(localizationLoadFailure);
};

/**
 *
 * @param {boolean} enable
 * @return {Object}
 */
export const toggleContentPlaceholders = enable => ({
  type: APP_TOGGLE_CONTENT_PLACEHOLDERS,
  enable,
});

/**
 *
 * @param {boolean} enable
 * @return {Object}
 */
export const toggleComponentTitles = enable => ({
  type: APP_TOGGLE_COMPONENT_TITLES,
  enable,
});
