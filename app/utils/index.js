'use strict';

import IntlMessageFormat from 'intl-messageformat';

const localizationFuncsMap = new WeakMap();

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
  * @param {Immutable.Map<string, string>} localization
  * @param {string} language
  * @param {string} id
  * @param {Object} [values={}]
  * @return {string}
  */
export const getLocalizedText = (localization, language, id, values = {}) =>
	new IntlMessageFormat(localization.get(id) || '', language).format(values);


/**
  *
  * @param {Object} state
  * @return {Function<string, string>:string}
  */
export const getLocalizedTextFromState = state =>
	localizationFuncsMap.get(state.app.localization)
	||	localizationFuncsMap.set(state.app.localization,
			(...args) => getLocalizedText(
					state.app.localization,
					state.app.language,
					...args
				)
		).get(state.app.localization);
