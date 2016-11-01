'use strict';

import IntlMessageFormat from 'intl-messageformat';

/**
 *
 * @param {string} prefix
 * @param {string} path
 * @returns {string}
 */
export const concatPath = (prefix, path) => {
    if (prefix === '') return path;
    if (prefix === '/') return '/' + path;
    return prefix + '/' + path;
};

export const getLocalizedText = (localization, language, id, values = {}) =>
    Object.keys(localization).length && (new IntlMessageFormat(localization.get(id), language)).format(values) || '';
