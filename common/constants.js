/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {RegExp}
 */
exports.PROJECT_NAME_REGEX = /^[a-zA-Z0-9_\-]{2,128}$/;

/**
 *
 * @type {string}
 */
exports.PROJECT_FILE = 'project.json';

/**
 *
 * @type {number}
 */
exports.PROJECT_FILE_VERSION = 1;

/**
 *
 * @type {string}
 */
exports.METADATA_DIR = '.jssy';

/**
 *
 * @type {string}
 */
exports.METADATA_FILE = 'meta.json';

/**
 *
 * @type {string}
 */
exports.METADATA_TYPES_FILE = 'types.json';

/**
 *
 * @type {string}
 */
exports.METADATA_STRINGS_FILE = 'strings.json';
