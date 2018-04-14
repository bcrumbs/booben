/**
 * @typedef {Object} Project
 * @property {number} version
 * @property {string} name
 * @property {?string} author
 * @property {string[]} componentLibs
 * @property {boolean} enableHTML
 * @property {?string} graphQLEndpointURL
 * @property {boolean} proxyGraphQLEndpoint
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
 * @property {boolean} redirectAuthenticated
 * @property {string} redirectAuthenticatedTo
 * @property {boolean} redirectAnonymous
 * @property {string} redirectAnonymousTo
 * @property {Object<string, string>} paramValues
 * @property {ProjectRoute[]} children
 * @property {?ProjectComponent} component
 */

/**
 * @typedef {Object} ProjectComponent
 * @property {number} id - Unique component ID
 * @property {string} name - Component name with namespace (e.g. "Namespace.MyComponent")
 * @property {string} title - User-defined title
 * @property {boolean} isWrapper
 * @property {Object<string, PlainJssyValue>} props
 * @property {Object<string, PlainJssyValue>} systemProps
 * @property {ProjectComponent[]} children
 * @property {number[]} regionsEnabled
 * @property {string} style - CSS for HTML components
 */

/**
 * @typedef {Object} PlainJssyValue
 * @property {string} source
 * @property {SourceDataStatic|SourceDataOwnerProp|SourceDataData|SourceDataConst|SourceDataActions|SourceDataDesigner|SourceDataFunction|SourceDataState|SourceDataRouteParams|SourceDataActionArg} sourceData
 */

/**
 * @typedef {Object<string, PlainJssyValue>} SourceDataStaticObjectValue
 */

/**
 * @typedef {PlainJssyValue[]} SourceDataStaticArrayValue
 */

/**
 * @typedef {Object} SourceDataStatic
 * @property {scalar|SourceDataStaticObjectValue|SourceDataStaticArrayValue} [value]
 * @property {string} [ownerPropName]
 */

/**
 * @typedef {Object} SourceDataOwnerProp
 * @property {string} ownerPropName
 */

/**
 * @typedef {Object} SourceDataConst
 * @property {*} value
 */

/**
 * @typedef {Object} SourceDataDesigner
 * @property {?ProjectComponent} component
 */

/**
 * @typedef {Object} QueryPathStep
 * @property {string} field
 * @property {number} connectionPageSize
 */

/**
 * @typedef {Object} SourceDataData
 * @property {string[]} dataContext
 * @property {QueryPathStep[]} queryPath
 * @property {Object<string, Object<string, PlainJssyValue>>} queryArgs
 */

/**
 * @typedef {Object} MutationActionParams
 * @property {string} mutation
 * @property {Object<string, PlainJssyValue>} args
 * @property {Action[]} successActions
 * @property {Action[]} errorActions
 */

/**
 * @typedef {Object} NavigateActionParams
 * @property {number} routeId
 * @property {Object<string, PlainJssyValue>} routeParams
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
 * @property {PlainJssyValue[]} args
 */

/**
 * @typedef {Object} PropChangeActionParams
 * @property {number} componentId
 * @property {string} propName
 * @property {string} systemPropName
 * @property {PlainJssyValue} value
 */

/**
 * @typedef {Object} AJAXActionParams
 * @property {PlainJssyValue} url
 * @property {string} method
 * @property {Object<string, string>} headers
 * @property {string} mode
 * @property {?PlainJssyValue} body
 * @property {string} decodeResponse
 * @property {Action[]} successActions
 * @property {Action[]} errorActions
 */

/**
 * @typedef {Object} LoadMoreDataActionParams
 * @property {number} componentId
 * @property {Array<string>} pathToDataValue
 * @property {Action[]} successActions
 * @property {Action[]} errorActions
 */

/**
 * @typedef {Object} Action
 * @property {string} type
 * @property {MutationActionParams|NavigateActionParams|URLActionParams|MethodCallActionParams|PropChangeActionParams|AJAXActionParams|LoadMoreDataActionParams} params
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
 * @typedef {Object} SourceDataRouteParams
 * @property {number} routeId
 * @property {string} paramName
 */

/**
 * @typedef {Object} SourceDataFunction
 * @property {string} functionSource - Can be 'project' or 'builtin'.
 * @property {string} function - Function name
 * @property {Array<?PlainJssyValue>} args
 */

/**
 * @typedef {Object} SourceDataActionArg
 * @property {number} arg
 */

/**
 * @typedef {Object} ProjectFunction
 * @property {string} title
 * @property {string} description
 * @property {FunctionArgument[]} args
 * @property {boolean} spreadLastArg
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
