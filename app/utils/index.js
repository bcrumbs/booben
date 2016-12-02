'use strict';

import IntlMessageFormat from 'intl-messageformat';

/**
 *
 * @param {string} prefix
 * @param {string} path
 * @return {string}
 */
export const concatPath = (prefix, path) => {
    if (prefix === '') return path;
    if (prefix === '/') return '/' + path;
    return prefix + '/' + path;
};

/**
  *
  * @param {Object} localization
  * @param {string} language
  * @param {string} id
  * @param {Object} [values={}]
  * @return {string}
  */
export const getLocalizedText = (localization, language, id, values = {}) =>
	new IntlMessageFormat(localization[id], language).format(values);
