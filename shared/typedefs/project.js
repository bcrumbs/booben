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
 * @property {Object<string, ProjectComponentProp>} systemProps
 * @property {ProjectComponent[]} children
 * @property {number[]} regionsEnabled
 * @property {Object<string, Object<string, Object<string, QueryArgumentValue>>>} queryArgs
 */

/**
 * @typedef {Object} ProjectComponentProp
 * @property {string} source
 * @property {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataActions|SourceDataDesigner|SourceDataFunction|SourceDataState} sourceData
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

/**
 * @typedef {Object} MutationActionParams
 * @property {string} mutation
 * @property {Object<string, ProjectComponentProp>} args
 * @property {Action[]} successActions
 * @property {Action[]} errorActions
 */

/**
 * @typedef {Object} NavigateActionParams
 * @property {number} routeId
 * @property {Object<string, ProjectComponentProp>} routeParams
 */

/**
 * @typedef {Object} URLActionParams
 * @property {string} url
 * @property {boolean} newWindow
 */

/**
 * @typedef {Object} MethodCallActionParams
 * @property {number} componentId
 * @property {string} method
 * @property {ProjectComponentProp[]} args
 */

/**
 * @typedef {Object} PropChangeActionParams
 * @property {number} componentId
 * @property {string} propName
 * @property {string} systemPropName
 * @property {ProjectComponentProp} value
 */

/**
 * @typedef {Object} Action
 * @property {string} type
 * @property {MutationActionParams|NavigateActionParams|URLActionParams|MethodCallActionParams|PropChangeActionParams} params
 */

/**
 * @typedef {Object} SourceDataActions
 * @property {Action[]} actions
 */

/**
 * @typedef {Object} SourceDataState
 * @property {number} componentId
 * @property {string} stateSlot
 */

/**
 * @typedef {Object} SourceDataFunction
 * @property {string} functionSource - Can be 'project' or 'builtin'.
 * @property {string} function - Function name
 * @property {Object<string, SourceDataStatic|SourceDataData|SourceDataConst|SourceDataFunction|SourceDataState>} args
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
