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
 * @property {?string} graphQLEndpointURL
 * @property {ProjectRoute[]} routes
 * @property {Object<string, ProjectFunction>} functions
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
 * @typedef {Object} QueryArgumentValue
 * @property {string} source
 * @property {SourceDataStatic} sourceData
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
 * @property {Object<string, Object<string, Object<string, QueryArgumentValue>>>} queryArgs
 */

/**
 * @typedef {Object} ProjectComponentProp
 * @property {string} source
 * @property {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataActions|SourceDataDesigner|SourceDataFunction} sourceData
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
 * @typedef {Object} QueryPathStep
 * @property {string} field
 */

/**
 * @typedef {Object} SourceDataData
 * @property {string[]} dataContext
 * @property {QueryPathStep[]} queryPath
 */

// TODO: Define SourceDataActions

/**
 * @typedef {Object} SourceDataActions
 */

/**
 * @typedef {Object} SourceDataFunction
 * @property {string} functionSource - Can be 'project' or 'builtin'.
 * @property {string} function - Function name
 * @property {Object<string, SourceDataStatic|SourceDataData|SourceDataConst|SourceDataFunction>} args
 */

/**
 * @typedef {Object} ProjectFunction
 * @property {string} title
 * @property {string} description
 * @property {FunctionArgument[]} args
 * @property {JssyTypeDefinition} returnType
 * @property {string} body
 */

/**
 * @typedef {Object} FunctionArgument
 * @property {string} name
 * @property {string} description
 * @property {JssyTypeDefinition} typedef
 * @property {boolean} isRequired
 * @property {*} [defaultValue]
 */
