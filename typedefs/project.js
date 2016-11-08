/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 * @typedef {Object} Project
 * @property {number} version
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
 * @property {boolean} haveIndex
 * @property {string} indexRouteDescription
 * @property {?ProjectComponent} indexComponent
 * @property {boolean} haveRedirect
 * @property {string} redirectTo
 * @property {ProjectRoute[]} children
 * @property {?ProjectComponent} component
 */

/**
 * @typedef {Object} ProjectComponent
 * @property {?number} id - Unique component ID or null for placeholders
 * @property {string} name - Component name with namespace (e.g. "Namespace.MyComponent")
 * @property {string} title - User-defined title
 * @property {Object<string, ProjectComponentProp>} props
 * @property {ProjectComponent[]} children
 * @property {number[]} regionsEnabled
 */

/**
 * @typedef {Object} ProjectComponentProp
 * @property {string} source
 * @property {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataActions|SourceDataDesigner} sourceData
 */

/**
 * @typedef {Object} SourceDataStatic
 * @property {*} value
 */

/**
 * @typedef {Object} SourceDataConst
 * @property {*} [value]
 * @property {string} [jssyConstId]
 */

/**
 * @typedef {Object} SourceDataDesigner
 * @property {?ProjectComponent} component
 */

// TODO: Define SourceDataData & SourceDataActions

/**
 * @typedef {Object} SourceDataData
 */

/**
 * @typedef {Object} SourceDataActions
 */
