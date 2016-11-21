/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {string}
 * @const
 */
exports.PREVIEW_DOM_CONTAINER_ID = '__jssy_container__';

/**
 *
 * @type {string}
 * @const
 */
exports.PREVIEW_DOM_OVERLAY_ID = '__jssy_overlay__';

/**
 *
 * @type {Set<string>}
 * @const
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
    'component'
]);
