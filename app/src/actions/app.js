import { getStrings } from '../lib/api';

export const APP_LOAD_STRINGS =
  'APP_LOAD_STRINGS';
export const APP_LOAD_STRINGS_SUCCESS =
  'APP_LOAD_STRINGS_SUCCESS';
export const APP_LOAD_STRINGS_FAILURE =
  'APP_LOAD_STRINGS_FAILURE';
export const APP_TOGGLE_CONTENT_PLACEHOLDERS =
  'APP_TOGGLE_CONTENT_PLACEHOLDERS';
export const APP_TOGGLE_INVISIBLE_COMPONENTS =
  'APP_TOGGLE_INVISIBLE_COMPONENTS';
export const APP_SHOW_FOOTER_TOGGLES =
  'APP_SHOW_FOOTER_TOGGLES';

/**
 *
 * @param {string} language
 * @param {Object} localization
 * @return {Object}
 */
const stringsLoadSuccess = (language, localization) => ({
  type: APP_LOAD_STRINGS_SUCCESS,
  language,
  localization,
});


/**
 *
 * @param {string} error
 * @return {Object}
 */
const stringsLoadFailure = error => ({
  type: APP_LOAD_STRINGS_FAILURE,
  error,
});

/**
 *
 * @return {Object}
 */
export const stringsLoading = () => ({
  type: APP_LOAD_STRINGS,
});

/**
 *
 * @param {string} language
 * @return {function(dispatch: function(action: Object))}
 */
export const loadStrings = language => dispatch => {
  dispatch(stringsLoading());

  getStrings(language)
    .then(strings => {
      dispatch(stringsLoadSuccess(language, strings));
    })
    .catch(err => {
      dispatch(stringsLoadFailure(err));
    });
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
export const toggleInvisibleComponents = enable => ({
  type: APP_TOGGLE_INVISIBLE_COMPONENTS,
  enable,
});

/**
 *
 * @param {boolean} show
 * @return {Object}
 */
export const showFooterToggles = show => ({
  type: APP_SHOW_FOOTER_TOGGLES,
  show,
});
