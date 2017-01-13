/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {string}
 */
exports.URL_API_PREFIX = '/api/v1';

/**
 *
 * @type {string}
 */
exports.URL_APP_PREFIX = '/app';

/**
 *
 * @type {string}
 */
exports.URL_PREVIEW_PREFIX = '/preview';

/**
 *
 * @type {string}
 */
exports.PREVIEW_DOM_CONTAINER_ID = '__jssy_container__';

/**
 *
 * @type {string}
 */
exports.PREVIEW_DOM_OVERLAY_ID = '__jssy_overlay__';

/**
 *
 * @type {Set<string>}
 */
exports.BUILT_IN_PROP_TYPES = new Set([
  'string',
  'bool',
  'int',
  'float',
  'oneOf',
  'shape',
  'object',
  'objectOf',
  'array',
  'arrayOf',
  'func',
  'component',
]);
