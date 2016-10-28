'use strict';
import { getLocalization } from '../api';

export const APP_LOCALIZATION_LOADING = 'APP_LOCALIZATION_LOADING';
export const APP_LOCALIZATION_LOAD_SUCCESS = 'APP_LOCALIZATION_LOAD_SUCCESS';
export const APP_LOCALIZATION_LOAD_FAILURE = 'APP_LOCALIZATION_LOAD_FAILURE';

/**
 *
 * @param {string} language
 * @param {Object} localization
 * @returns {Object}
 */
export const localizationLoadSuccess = (language, localization) => ({
  type: APP_LOCALIZATION_LOAD_SUCCESS,
  language,
  localization
});


/**
  * @param {string} error
  * @returns {Object}
  */
export const localizationLoadFailure = error => ({
  type: APP_LOCALIZATION_LOAD_FAILURE,
  error
});

export const localizationLoading = () => ({
  type: APP_LOCALIZATION_LOADING
});

export const loadLocalization = language => dispatch => {
  dispatch(localizationLoading());
  getLocalization(language)
    .then((localization) => dispatch(localizationLoadSuccess(language, localization)))
    .catch(localizationLoadFailure);
};
