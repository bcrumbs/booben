/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 * @typedef {Object} Project
 * @property {string} name
 * @property {?string} author
 * @property {string[]} componentLibs
 * @property {?string} relayEndpointURL
 * @property {ProjectRoute[]} routes
 */

/**
 * @typedef {Object} ProjectRoute
 * @property {string} path
 * @property {ProjectRoute[]} children
 * @property {ProjectComponent} component
 */

/**
 * @typedef {Object} ProjectComponent
 * @property {string} name - Component name with namespace (e.g. "Namespace.MyComponent")
 * @property {Object.<string, ProjectComponentProp>} props
 * @property {ProjectComponent[]} [children]
 */

/**
 * @typedef {Object} ProjectComponentProp
 * @property {string} source
 * @property {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataAction|SourceDataDesigner} sourceData
 */

/**
 * @typedef {Object} SourceDataStatic
 * @property {*} value
 */

// TODO: Define SourceDataData, SourceDataConst, SourceDataDesigner, SourceDataAction

/**
 * @typedef {Object} SourceDataData
 */

/**
 * @typedef {Object} SourceDataConst
 */

/**
 * @typedef {Object} SourceDataDesigner
 */

/**
 * @typedef {Object} SourceDataAction
 */
