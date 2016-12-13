/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 * @typedef {Object} DataSchema
 * @property {Object<string, Object>} types
 * @property {string} queryTypeName
 */

/**
 * @typedef {Object} DataObjectType
 * @property {string} description
 * @property {string[]} interfaces
 * @property {Object<string, DataField>} fields
 */

/**
 * @typedef {Object} DataField
 * @property {string} description
 * @property {string} type
 * @property {string} kind - Can be 'SINGLE', 'LIST' or 'CONNECTION'.
 * @property {boolean} nonNull
 * @property {Object<string, DataFieldArg>} args
 */

/**
 * @typedef {Object} DataFieldArg
 * @property {string} description
 * @property {string} type
 * @property {string} kind - Can be 'SINGLE', 'LIST' or 'CONNECTION'.
 * @property {boolean} nonNull
 * @property {*} defaultValue
 */
