/**
 * @author Dmitriy Bizyaev
 */

import _mapValues from 'lodash.mapvalues';
import { TypeNames, makeDefaultNonNullValue } from '@jssy/types';
import { arrayToObject, getter } from './misc';

/**
 * @typedef {Object} GQLSchema
 * @property {GQLType[]} types
 * @property {GQLDirective[]} directives
 * @property {?GQLType} queryType
 * @property {?GQLType} mutationType
 * @property {?GQLType} subscriptionType
 */

/**
 * @typedef {Object} GQLType
 * @property {string} kind
 * @property {?string} name
 * @property {?string} description
 * @property {?GQLField[]} fields
 * @property {?GQLType[]} interfaces
 * @property {?GQLType[]} possibleTypes
 * @property {?GQLEnumValue[]} enumValues
 * @property {?GQLInputValue[]} inputFields
 * @property {?GQLType} ofType
 */

/**
 * @typedef {Object} GQLEnumValue
 * @property {string} name
 * @property {?string} description
 * @property {boolean} isDeprecated
 * @property {?string} deprecationReason
 */

/**
 * @typedef {Object} GQLField
 * @property {string} name
 * @property {?string} description
 * @property {GQLType} type
 * @property {GQLInputValue[]} args
 * @property {boolean} isDeprecated
 * @property {?string} deprecationReason
 */

/**
 * @typedef {Object} GQLInputValue
 * @property {string} name
 * @property {?string} description
 * @property {GQLType} type
 * @property {?string} defaultValue
 */

/**
 * @typedef {Object} GQLDirective
 * @property {string} name
 * @property {?string} description
 * @property {string[]} locations
 * @property {GQLInputValue[]} args
 */


/**
 * @typedef {Object} DataSchema
 * @property {Object<string, DataObjectType>} types
 * @property {Object<string, DataEnumType>} enums
 * @property {string[]} customScalarTypes
 * @property {?string} queryTypeName
 * @property {?string} mutationTypeName
 * @property {boolean} relay
 * @property {boolean} pageInfoHasCursors
 */

/**
 * @typedef {Object} DataObjectType
 * @property {string} name
 * @property {string} description
 * @property {Object<string, DataField>} fields
 * @property {string[]} interfaces
 */

/**
 * @typedef {Object} DataEnumValue
 * @property {string} name
 * @property {string} description
 */

/**
 * @typedef {Object} DataEnumType
 * @property {string} name
 * @property {string} description
 * @property {DataEnumValue[]} values
 */

/**
 * @typedef {Object} DataFieldTypeDefinition
 * @property {string} name
 * @property {string} description
 * @property {string} type
 * @property {number} kind - Can be FieldKinds.SINGLE, FieldKinds.LIST
 * or FieldKinds.CONNECTION.
 * @property {boolean} nonNull
 * @property {boolean} nonNullMember
 */

/**
 * @typedef {DataFieldTypeDefinition} DataField
 * @property {Object<string, DataFieldArg>} args
 * @property {?Object<string, DataField>} connectionFields
 */

/**
 * @typedef {DataFieldTypeDefinition} DataFieldArg
 * @property {*} defaultValue
 */

/**
 *
 * @type {Object<string, string>}
 */
export const FieldKinds = {
  SINGLE: 0,
  LIST: 1,
  CONNECTION: 2,
};

/**
 *
 * @type {string}
 */
const CONNECTION_FIELD_NAME_SEPARATOR = '/';

/**
 *
 * @type {Object<string, string>}
 */
const GQLTypeKinds = {
  SCALAR: 'SCALAR',
  OBJECT: 'OBJECT',
  INTERFACE: 'INTERFACE',
  UNION: 'UNION',
  ENUM: 'ENUM',
  INPUT_OBJECT: 'INPUT_OBJECT',
  LIST: 'LIST',
  NON_NULL: 'NON_NULL',
};

/**
 *
 * @type {Set<string>}
 */
const GQL_SCALAR_TYPES = new Set([
  'Int',
  'Float',
  'Boolean',
  'String',
  'ID',
]);

/**
 *
 * @type {Object<string, string>}
 */
const graphQLScalarTypeToJssyType = {
  Int: TypeNames.INT,
  Float: TypeNames.FLOAT,
  Boolean: TypeNames.BOOL,
  String: TypeNames.STRING,
  ID: TypeNames.STRING,
};

/**
 *
 * @param {string} graphQLTypeName
 * @return {boolean}
 */
export const isBuiltinGraphQLType = graphQLTypeName =>
  GQL_SCALAR_TYPES.has(graphQLTypeName);

const RELAY_TYPE_NODE_INTERFACE = 'Node';
const RELAY_TYPE_PAGEINFO = 'PageInfo';
const RELAY_CONNECTION_ARGS_NUM = 4;
const RELAY_CONNECTION_ARG_FIRST = 'first';
const RELAY_CONNECTION_ARG_LAST = 'last';
const RELAY_CONNECTION_ARG_AFTER = 'after';
const RELAY_CONNECTION_ARG_BEFORE = 'before';
const RELAY_CONNECTION_FIELDS_NUM = 2;
const RELAY_CONNECTION_FIELD_EDGES = 'edges';
const RELAY_CONNECTION_FIELD_PAGEINFO = 'pageInfo';
const RELAY_PAGEINFO_FIELDS_NUM = 2;
const RELAY_PAGEINFO_FIELD_HAS_NEXT_PAGE = 'hasNextPage';
const RELAY_PAGEINFO_FIELD_HAS_PREVIOUS_PAGE = 'hasPreviousPage';
const RELAY_PAGEINFO_FIELD_START_CURSOR = 'startCursor';
const RELAY_PAGEINFO_FIELD_END_CURSOR = 'endCursor';
const RELAY_EDGE_FIELDS_NUM = 2;
const RELAY_EDGE_FIELD_NODE = 'node';
const RELAY_EDGE_FIELD_CURSOR = 'cursor';

/**
 *
 * @param {GQLSchema} schema
 * @param {string} typeName
 * @return {?GQLType}
 */
const findGQLType = (schema, typeName) =>
  schema.types.find(type => type.name === typeName) || null;

/**
 *
 * @param {GQLType} type
 * @param {string} fieldName
 * @return {?GQLField}
 */
const findGQLField = (type, fieldName) => {
  if (!type.fields) return null;
  return type.fields.find(field => field.name === fieldName) || null;
};

/**
 * @typedef {Object} DataTypeInfo
 * @property {string} typeName
 * @property {string} typeKind
 * @property {boolean} isList
 * @property {boolean} nonNull
 * @property {boolean} nonNullMember
 */

/**
 *
 * @param {GQLType} type
 * @return {DataTypeInfo}
 */
const collectTypeInfo = type => {
  let currentType = type;
  let isList = false;
  let nonNull = false;
  let nonNullMember = false;
  
  if (currentType.kind === GQLTypeKinds.NON_NULL) {
    nonNull = true;
    currentType = currentType.ofType;
  }
  
  if (currentType.kind === GQLTypeKinds.LIST) {
    isList = true;
    currentType = currentType.ofType;
    
    if (currentType.kind === GQLTypeKinds.NON_NULL) {
      nonNullMember = true;
      currentType = currentType.ofType;
    }
  }
  
  return {
    typeName: currentType.name,
    typeKind: currentType.kind,
    isList,
    nonNull,
    nonNullMember,
  };
};

/**
 *
 * @param {GQLField} field
 * @param {GQLSchema} schema
 * @return {?GQLType}
 */
const getGQLFieldType = (field, schema) => {
  const { typeName } = collectTypeInfo(field.type);
  return findGQLType(schema, typeName);
};

/**
 *
 * @param {GQLField} field
 * @param {string} argName
 * @return {?GQLInputValue}
 */
const findFieldArg = (field, argName) => {
  if (!field.args) return null;
  return field.args.find(arg => arg.name === argName) || null;
};

/**
 *
 * @param {GQLType} type
 * @return {boolean}
 */
const isObjectType = type =>
  type.kind === GQLTypeKinds.OBJECT || type.kind === GQLTypeKinds.INPUT_OBJECT;

/**
 *
 * @param {GQLType} type
 * @return {boolean}
 */
const isEnumType = type => type.kind === GQLTypeKinds.ENUM;

/**
 *
 * @param {GQLType} type
 * @return {boolean}
 */
const isScalarType = type => type.kind === GQLTypeKinds.SCALAR;

/**
 *
 * @param {GQLType} type
 * @param {string} interfaceName
 * @return {boolean}
 */
const gqlTypeHasInterface = (type, interfaceName) =>
  type.interfaces &&
  !!type.interfaces.find(iface =>
    iface.kind === GQLTypeKinds.INTERFACE &&
    iface.name === interfaceName,
  );

/**
 *
 * @param {GQLType} type
 * @return {boolean}
 */
const isRelayNodeInterface = type =>
  type.name === RELAY_TYPE_NODE_INTERFACE &&
  type.kind === GQLTypeKinds.INTERFACE &&
  type.fields.length === 1 &&
  type.fields[0].type.kind === GQLTypeKinds.NON_NULL &&
  type.fields[0].type.ofType &&
  type.fields[0].type.ofType.name === 'ID';

/**
 *
 * @param {GQLSchema} schema
 * @return {?GQLType}
 */
const findRelayNodeInterface = schema =>
  schema.types.find(isRelayNodeInterface) || null;

/**
 *
 * @param {GQLType} type
 * @return {boolean}
 */
const isRelayPageInfoType = type => {
  if (type.kind !== GQLTypeKinds.OBJECT || type.name !== RELAY_TYPE_PAGEINFO)
    return false;
  
  if (!type.fields || type.fields.length !== RELAY_PAGEINFO_FIELDS_NUM)
    return false;
  
  const hasNextPageField =
    findGQLField(type, RELAY_PAGEINFO_FIELD_HAS_NEXT_PAGE);
  
  if (
    !hasNextPageField ||
    hasNextPageField.type.kind !== GQLTypeKinds.NON_NULL ||
    hasNextPageField.type.ofType.name !== 'Boolean'
  ) return false;
  
  const hasPreviousPageField =
    findGQLField(type, RELAY_PAGEINFO_FIELD_HAS_PREVIOUS_PAGE);
  
  //noinspection RedundantIfStatementJS
  if (
    !hasPreviousPageField ||
    hasPreviousPageField.type.kind !== GQLTypeKinds.NON_NULL ||
    hasPreviousPageField.type.ofType.name !== 'Boolean'
  ) return false;
  
  return true;
};

/**
 *
 * @param {GQLType} pageInfoType
 * @return {boolean}
 */
const pageInfoHasCursors = pageInfoType => {
  const startCursorField =
    findGQLField(pageInfoType, RELAY_PAGEINFO_FIELD_START_CURSOR);
  
  if (!startCursorField || startCursorField.type.name !== 'String')
    return false;
  
  const endCursorField =
    findGQLField(pageInfoType, RELAY_PAGEINFO_FIELD_END_CURSOR);
  
  //noinspection RedundantIfStatementJS
  if (!endCursorField || endCursorField.type.name !== 'String')
    return false;
  
  return true;
};

/**
 *
 * @param {GQLSchema} schema
 * @return {?GQLType}
 */
const findRelayPageInfoType = schema =>
  schema.types.find(isRelayPageInfoType) || null;

/**
 *
 * @param {GQLField} field
 * @return {boolean}
 */
const isRelayNodeField = field =>
  field.type.kind === GQLTypeKinds.OBJECT || (
    field.type.kind === GQLTypeKinds.NON_NULL &&
    field.type.ofType.kind === GQLTypeKinds.OBJECT
  );

/**
 *
 * @param {GQLType} type
 * @param {GQLSchema} schema
 * @return {boolean}
 */
const isRelayEdgeType = (type, schema) => {
  if (type.kind !== GQLTypeKinds.OBJECT) return false;
  if (!type.fields || type.fields.length < RELAY_EDGE_FIELDS_NUM) return false;
  
  const cursorField = findGQLField(type, RELAY_EDGE_FIELD_CURSOR);
  
  if (
    !cursorField ||
    cursorField.type.kind !== GQLTypeKinds.NON_NULL ||
    cursorField.type.ofType.name !== 'String'
  ) return false;
  
  const nodeField = findGQLField(type, RELAY_EDGE_FIELD_NODE);
  if (!nodeField || !isRelayNodeField(nodeField)) return false;
  
  const nodeType = findGQLType(
    schema,
    nodeField.type.name || nodeField.type.ofType.name,
  );
  
  //noinspection RedundantIfStatementJS
  if (!gqlTypeHasInterface(nodeType, RELAY_TYPE_NODE_INTERFACE)) return false;
  
  return true;
};

/**
 *
 * @param {GQLField} field
 * @param {GQLSchema} schema
 * @param {Object} relayTypes
 * @param {GQLType} relayTypes.pageInfo
 * @param {GQLType} relayTypes.nodeInterface
 * @return {boolean}
 */
const isRelayConnectionField = (field, schema, relayTypes) => {
  if (!field.args) return false;
  if (field.args.length < RELAY_CONNECTION_ARGS_NUM) return false;

  const firstArg = findFieldArg(field, RELAY_CONNECTION_ARG_FIRST);
  if (!firstArg || firstArg.type.name !== 'Int') return false;

  const lastArg = findFieldArg(field, RELAY_CONNECTION_ARG_LAST);
  if (!lastArg || lastArg.type.name !== 'Int') return false;

  const afterArg = findFieldArg(field, RELAY_CONNECTION_ARG_AFTER);
  if (!afterArg || afterArg.type.name !== 'String') return false;

  const beforeArg = findFieldArg(field, RELAY_CONNECTION_ARG_BEFORE);
  if (!beforeArg || beforeArg.type.name !== 'String') return false;

  const connectionType = getGQLFieldType(field, schema);
  if (!connectionType) return false;
  if (connectionType.fields.length < RELAY_CONNECTION_FIELDS_NUM) return false;

  const pageInfoField =
    findGQLField(connectionType, RELAY_CONNECTION_FIELD_PAGEINFO);
  if (!pageInfoField) return false;
  
  const pageInfoType = getGQLFieldType(pageInfoField, schema);
  if (!pageInfoType || pageInfoType !== relayTypes.pageInfo) return false;

  const edgesField = findGQLField(connectionType, RELAY_CONNECTION_FIELD_EDGES);
  if (!edgesField || edgesField.type.kind !== GQLTypeKinds.LIST) return false;

  const edgeType = findGQLType(schema, edgesField.type.ofType.name);
  //noinspection RedundantIfStatementJS
  if (!isRelayEdgeType(edgeType, schema)) return false;
  
  return true;
};

/**
 *
 * @param {GQLField} connectionField
 * @param {GQLSchema} schema
 * @return {GQLField[]}
 */
const getAdditionalFieldsOnRelayConnection = (connectionField, schema) => {
  const connectionType = getGQLFieldType(connectionField, schema);
  return connectionType.fields.filter(field =>
    field.name !== RELAY_CONNECTION_FIELD_EDGES &&
    field.name !== RELAY_CONNECTION_FIELD_PAGEINFO,
  );
};

/**
 *
 * @param {GQLField} connectionField
 * @return {GQLInputValue[]}
 */
const getAdditionalArgsOnRelayConnection = connectionField =>
  connectionField.args.filter(arg =>
    arg.name !== RELAY_CONNECTION_ARG_FIRST &&
    arg.name !== RELAY_CONNECTION_ARG_LAST &&
    arg.name !== RELAY_CONNECTION_ARG_AFTER &&
    arg.name !== RELAY_CONNECTION_ARG_BEFORE,
  );

/**
 *
 * @param {GQLField} connectionField
 * @param {GQLSchema} schema
 * @return {GQLType}
 */
const getRelayConnectionNodeType = (connectionField, schema) => {
  const connectionType = getGQLFieldType(connectionField, schema);
  const edgesField = findGQLField(connectionType, RELAY_CONNECTION_FIELD_EDGES);
  const edgeType = findGQLType(schema, edgesField.type.ofType.name);
  const nodeField = findGQLField(edgeType, RELAY_EDGE_FIELD_NODE);
  
  return getGQLFieldType(nodeField, schema);
};

/**
 *
 * @param {GQLSchema} schema
 * @return {DataSchema}
 */
export const parseGraphQLSchema = schema => {
  const queryTypeName = (schema.queryType && schema.queryType.name)
    ? schema.queryType.name
    : null;
  
  const mutationTypeName = (schema.mutationType && schema.mutationType.name)
    ? schema.mutationType.name
    : null;
  
  const relayTypes = {
    nodeInterface: findRelayNodeInterface(schema),
    pageInfo: findRelayPageInfoType(schema),
  };
  
  const haveRelay =
    !!relayTypes.nodeInterface &&
    !!relayTypes.pageInfo;
  
  const retTypes = {};
  const retEnums = {};
  const retCustomScalars = [];
  
  /* eslint-disable no-use-before-define */
  
  /**
   *
   * @param {GQLInputValue} arg
   * @return {DataFieldArg}
   */
  const convertArg = arg => {
    const argTypeInfo = collectTypeInfo(arg.type);
    
    if (!isBuiltinGraphQLType(argTypeInfo.typeName)) {
      const type = findGQLType(schema, argTypeInfo.typeName);
      if (isObjectType(type)) visitGQLObjectType(type, true);
      else if (isEnumType(type)) visitGQLEnumType(type);
      else if (isScalarType(type)) visitGQLCustomScalarType(type);
    }
    
    return {
      type: argTypeInfo.typeName,
      name: arg.name,
      description: arg.description || '',
      kind: argTypeInfo.isList ? FieldKinds.LIST : FieldKinds.SINGLE,
      nonNull: argTypeInfo.nonNull,
      nonNullMember: argTypeInfo.nonNullMember,
      defaultValue: arg.defaultValue,
    };
  };
  
  /**
   *
   * @param {GQLField} field
   * @return {DataField}
   */
  const convertRelayConnectionField = field => {
    const nodeType = getRelayConnectionNodeType(field, schema);
    visitGQLObjectType(nodeType);
  
    const connectionFields = getAdditionalFieldsOnRelayConnection(
      field,
      schema,
    );
  
    const args = getAdditionalArgsOnRelayConnection(field);
  
    return {
      type: nodeType.name,
      name: field.name,
      description: field.description || '',
      kind: FieldKinds.CONNECTION,
      nonNull: true,
      nonNullMember: false,
      args: arrayToObject(args, getter('name'), convertArg),
      connectionFields: arrayToObject(
        connectionFields,
        getter('name'),
        convertGQLField,
      ),
    };
  };
  
  /**
   *
   * @param {GQLField} field
   * @return {DataField}
   */
  const convertRegularField = field => {
    const fieldTypeInfo = collectTypeInfo(field.type);
  
    if (!isBuiltinGraphQLType(fieldTypeInfo.typeName)) {
      const type = findGQLType(schema, fieldTypeInfo.typeName);
      if (isObjectType(type)) visitGQLObjectType(type);
      else if (isEnumType(type)) visitGQLEnumType(type);
      else if (isScalarType(type)) visitGQLCustomScalarType(type);
    }
  
    return {
      type: fieldTypeInfo.typeName,
      name: field.name,
      description: field.description || '',
      kind: fieldTypeInfo.isList ? FieldKinds.LIST : FieldKinds.SINGLE,
      nonNull: fieldTypeInfo.nonNull,
      nonNullMember: fieldTypeInfo.nonNullMember,
      args: field.args
        ? arrayToObject(field.args, getter('name'), convertArg)
        : {},
      connectionFields: null,
    };
  };
  
  /**
   *
   * @param {GQLField} field
   * @return {boolean}
   */
  const includeGQLField = field => {
    const { typeKind } = collectTypeInfo(field.type);
    
    // We don't know (yet) how to deal with INTERFACE and UNION types
    return typeKind !== GQLTypeKinds.INTERFACE &&
      typeKind !== GQLTypeKinds.UNION;
  };
  
  /**
   *
   * @param {GQLField} field
   * @return {DataField}
   */
  const convertGQLField = field =>
    (haveRelay && isRelayConnectionField(field, schema, relayTypes))
      ? convertRelayConnectionField(field)
      : convertRegularField(field);
  
  const visitedTypes = new Set();
  
  /**
   *
   * @param {GQLType} type
   */
  const visitGQLEnumType = type => {
    if (visitedTypes.has(type.name)) return;
    visitedTypes.add(type.name);
    
    retEnums[type.name] = {
      name: type.name,
      description: type.description,
      values: type.enumValues.map(value => ({
        name: value.name,
        description: value.description,
      })),
    };
  };
  
  /**
   *
   * @param {GQLType} type
   * @param {boolean} [isInputType=false]
   */
  const visitGQLObjectType = (type, isInputType = false) => {
    if (visitedTypes.has(type.name)) return;
    visitedTypes.add(type.name);
    
    const fields = isInputType ? type.inputFields : type.fields;
    
    retTypes[type.name] = {
      name: type.name,
      description: type.description || '',
      fields: fields
        ? arrayToObject(
          fields,
          getter('name'),
          convertGQLField,
          includeGQLField,
        )
        : {},
      interfaces: type.interfaces
        ? type.interfaces.map(iface => iface.name)
        : [],
    };
  };
  
  /**
   *
   * @param {GQLType} type
   */
  const visitGQLCustomScalarType = type => {
    retCustomScalars.push(type.name);
  };
  
  /* eslint-enable no-use-before-define */
  
  if (queryTypeName)
    visitGQLObjectType(findGQLType(schema, queryTypeName));
  if (mutationTypeName)
    visitGQLObjectType(findGQLType(schema, mutationTypeName));
  
  return {
    types: retTypes,
    enums: retEnums,
    customScalarTypes: retCustomScalars,
    queryTypeName,
    mutationTypeName,
    relay: haveRelay,
    pageInfoHasCursors: haveRelay && pageInfoHasCursors(relayTypes.pageInfo),
  };
};

/**
 *
 * @param {string} fullFieldName
 * @return {{fieldName: string, connectionFieldName: string}}
 */
export const parseFieldName = fullFieldName => {
  const [fieldName, connectionFieldName = ''] =
    fullFieldName.split(CONNECTION_FIELD_NAME_SEPARATOR);
  
  return { fieldName, connectionFieldName };
};

/**
 *
 * @param {string} fieldName
 * @param {string} connectionFieldName
 * @return {string}
 */
export const formatFieldName = (fieldName, connectionFieldName) => {
  if (connectionFieldName) return `${fieldName}/${connectionFieldName}`;
  return fieldName;
};

/**
 *
 * @param {DataSchema} schema
 * @param {string} fullFieldName
 * @param {string} onType
 * @return {string}
 */
export const getTypeNameByField = (schema, fullFieldName, onType) => {
  const { fieldName, connectionFieldName } = parseFieldName(fullFieldName);
  let field = schema.types[onType].fields[fieldName];

  if (connectionFieldName)
    field = field.connectionFields[connectionFieldName];

  return field.type;
};

/**
 *
 * @param {DataSchema} schema - Schema
 * @param {string[]} path - Array of field names
 * @param {string} [startType=''] - Name of type to start from
 * @return {string}
 */
export const getTypeNameByPath = (schema, path, startType = '') => path.reduce(
  (acc, cur) => getTypeNameByField(schema, cur, acc),
  startType || schema.queryTypeName,
);

const getJssyTypeOfFieldMemo = new Map();

/**
 *
 * @param {DataFieldTypeDefinition} fieldTypedef
 * @param {DataSchema} schema
 * @param {boolean} [checkRequired=false]
 * @return {JssyValueDefinition}
 */
const _getJssyTypeOfField = (fieldTypedef, schema, checkRequired) => {
  let memoBySchema = getJssyTypeOfFieldMemo.get(schema);
  if (!memoBySchema) {
    memoBySchema = new Map();
    getJssyTypeOfFieldMemo.set(schema, memoBySchema);
  }
  
  const memoized = memoBySchema.get(fieldTypedef);
  if (memoized) return memoized;
  
  let deferredSubFields = null;
  let deferredSubFieldsTarget = null;
  let ret;
  
  if (isBuiltinGraphQLType(fieldTypedef.type)) {
    ret = {
      type: graphQLScalarTypeToJssyType[fieldTypedef.type],
    };
  } else if (schema.types[fieldTypedef.type]) {
    const type = schema.types[fieldTypedef.type];
    
    ret = {
      type: TypeNames.SHAPE,
      fields: null,
    };
    
    deferredSubFields = type.fields;
    deferredSubFieldsTarget = ret;
  } else if (schema.enums[fieldTypedef.type]) {
    ret = {
      type: TypeNames.ONE_OF,
      options: schema.enums[fieldTypedef.type].values.map(value => ({
        value: value.name,
      })),
    };
  } else if (schema.customScalarTypes.indexOf(fieldTypedef.type) !== -1) {
    ret = {
      type: TypeNames.SCALAR,
      name: fieldTypedef.type,
    };
  } else {
    throw new Error(`Unknown field type in schema: '${fieldTypedef.type}'`);
  }
  
  if (
    fieldTypedef.kind === FieldKinds.LIST ||
    fieldTypedef.kind === FieldKinds.CONNECTION
  ) {
    if (fieldTypedef.nonNullMember && ret.type === TypeNames.SHAPE)
      ret.notNull = true;
    
    ret = {
      type: TypeNames.ARRAY_OF,
      ofType: ret,
    };
  } else if (fieldTypedef.nonNull && ret.type === TypeNames.SHAPE) {
    ret.notNull = true;
  }
  
  memoBySchema.set(fieldTypedef, ret);
  
  if (deferredSubFields) {
    deferredSubFieldsTarget.fields = _mapValues(
      deferredSubFields,
      subField => _getJssyTypeOfField(subField, schema, true),
    );
  }

  if (checkRequired) ret.required = fieldTypedef.nonNull;
  
  ret.label = fieldTypedef.name;
  ret.description = fieldTypedef.description;
  ret.source = ['static', 'state'];
  ret.sourceConfigs = {
    static: {
      default: makeDefaultNonNullValue(ret),
    },
    state: {},
  };
  
  return ret;
};

/**
 *
 * @param {DataFieldTypeDefinition} fieldTypedef
 * @param {DataSchema} schema
 * @return {JssyValueDefinition}
 */
export const getJssyTypeOfField = (fieldTypedef, schema) =>
  _getJssyTypeOfField(fieldTypedef, schema);

/**
 *
 * @param {DataField} field
 * @return {boolean}
 */
export const fieldHasArguments = field => Object.keys(field.args).length > 0;

/**
 *
 * @param {DataSchema} schema
 * @param {string[]} path
 * @param {string} rootTypeName
 * @return {DataField[]}
 */
export const getFieldsByPath = (
  schema,
  path,
  rootTypeName = schema.queryTypeName,
) => {
  const ret = [];
  let currentType = schema.types[rootTypeName];
  let i = 0;
  
  while (i < path.length) {
    const { fieldName, connectionFieldName } = parseFieldName(path[i]);
    let field = currentType.fields[fieldName];
    
    if (connectionFieldName)
      field = field.connectionFields[connectionFieldName];
    
    ret.push(field);
    currentType = schema.types[field.type];
    i++;
  }
  
  return ret;
};

/**
 *
 * @param {DataSchema} schema
 * @param {string} mutationName
 * @return {?DataField}
 */
export const getMutationField = (schema, mutationName) => {
  if (!schema.mutationTypeName) return null;
  const mutationType = schema.types[schema.mutationTypeName];
  return mutationType.fields[mutationName] || null;
};

/**
 *
 * @param {DataSchema} schema
 * @return {?DataObjectType}
 */
export const getMutationType = schema => {
  if (!schema.mutationTypeName) return null;
  return schema.types[schema.mutationTypeName];
};
