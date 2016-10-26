/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 * @typedef {Object|Immutable.Record} Project
 * @property {number} version
 * @property {string} name
 * @property {?string} author
 * @property {string[]} componentLibs
 * @property {?string} relayEndpointURL
 * @property {ProjectRoute[]|Immutable.List<ProjectRoute>} routes
 */

/**
 * @typedef {Object|Immutable.Record} ProjectRoute
 * @property {number} id
 * @property {string} path
 * @property {string} title
 * @property {string} description
 * @property {boolean} haveIndex
 * @property {string} indexRouteDescription
 * @property {?ProjectComponent} indexComponent
 * @property {boolean} haveRedirect
 * @property {string} redirectTo
 * @property {ProjectRoute[]|Immutable.List<ProjectRoute>} children
 * @property {?ProjectComponent} component
 */

/**
 * @typedef {Object|Immutable.Record} ProjectComponent
 * @property {number} id - Unique component ID
 * @property {string} name - Component name with namespace (e.g. "Namespace.MyComponent")
 * @property {string} title - User-defined title
 * @property {Object<string, ProjectComponentProp>|Immutable.Map<string, ProjectComponentProp>} props
 * @property {ProjectComponent[]|Immutable.List<ProjectComponent>} [children]
 */

/**
 * @typedef {Object|Immutable.Record} ProjectComponentProp
 * @property {string} source
 * @property {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataAction|SourceDataDesigner} sourceData
 */

/**
 * @typedef {Object|Immutable.Record} SourceDataStatic
 * @property {*} value
 */

// TODO: Define SourceDataData, SourceDataConst, SourceDataDesigner, SourceDataAction

/**
 * @typedef {Object|Immutable.Record} SourceDataData
 */

/**
 * @typedef {Object|Immutable.Record} SourceDataConst
 */

/**
 * @typedef {Object|Immutable.Record} SourceDataDesigner
 */

/**
 * @typedef {Object|Immutable.Record} SourceDataAction
 */
