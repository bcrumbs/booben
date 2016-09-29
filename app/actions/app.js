/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {string}
 */
export const APP_SET_LANGUAGE = 'APP_SET_LANGUAGE';

/**
 *
 * @param {string} language
 * @returns {Object}
 */
export const setLanguage = language => ({
    type: APP_SET_LANGUAGE,
    language
});
