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
 * @property {number} id
 * @property {string} path
 * @property {string} title
 * @property {string} description
 * @property {boolean} haveIndexRoute
 * @property {?ProjectComponent} indexComponent
 * @property {boolean} haveRedirect
 * @property {string} redirectTo
 * @property {ProjectRoute[]} children
 * @property {?ProjectComponent} component
 */

/**
 * @typedef {Object} ProjectComponent
 * @property {string} uid - Unique component ID
 * @property {string} name - Component name with namespace (e.g. "Namespace.MyComponent")
 * @property {string} title - User-defined title
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
