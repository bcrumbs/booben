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
 * @property {number} id - Unique component ID
 * @property {string} name - Component name with namespace (e.g. "Namespace.MyComponent")
 * @property {string} title - User-defined title
 * @property {boolean} isWrapper
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
 * @typedef {Object<string, ProjectComponentProp>} SourceDataStaticObjectValue
 */

/**
 * @typedef {ProjectComponentProp[]} SourceDataStaticArrayValue
 */

/**
 * @typedef {Object} SourceDataStatic
 * @property {scalar|SourceDataStaticObjectValue|SourceDataStaticArrayValue} [value]
 * @property {string} [ownerPropName]
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

/**
 * @typedef {Object} QueryPathStepArgument
 * @property {string} source
 * @property {SourceDataStatic} sourceData
 */

/**
 * @typedef {Object} QueryPathStep
 * @property {string} field
 * @property {Object<string, QueryPathStepArgument>} args
 */

/**
 * @typedef {Object} SourceDataData
 * @property {number} [dataContextIndex] - 0 = query root; can be >0 only in own components
 * @property {QueryPathStep[]} queryPath
 */

// TODO: Define SourceDataActions

/**
 * @typedef {Object} SourceDataActions
 */
