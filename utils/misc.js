/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @param {Object} object
 * @param {string[]} allowedKeys
 * @return {Object}
 */
exports.sanitizeObject = (object, allowedKeys) => {
  const keys = Object.keys(object),
    ret = {};

  for (let i = 0, l = keys.length; i < l; i++) {
    if (allowedKeys.indexOf(keys[i]) > -1)
      ret[keys[i]] = object[keys[i]];
  }

  return ret;
};
