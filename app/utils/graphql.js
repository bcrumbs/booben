/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import _forOwn from 'lodash.forown';
import { Record, Map, List } from 'immutable';
import { NO_VALUE } from '../constants/misc';

import {
  walkSimpleProps,
  walkComponentsTree,
} from '../models/ProjectComponent';

import {
  getTypeNameByField,
  getTypeNameByPath,
  getMutationField,
  FieldKinds,
  parseFieldName,
  isBuiltinGraphQLType,
} from './schema';

import {
  getComponentMeta,
  isJssyValueDefinition,
  valueHasDataContest,
} from './meta';

import { objectToArray } from './misc';

const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '1234567890';
const LETTERS = UPPERCASE_LETTERS + LOWERCASE_LETTERS;
const LETTERS_LEN = LETTERS.length;
const ALL_CHARS = LETTERS + NUMBERS;
const ALL_CHARS_LEN = ALL_CHARS.length;

const IS_FINISHED_FRAGMENT =
  Symbol('Indicates that graphql fragment has leaf fields');

const SCALAR_TYPES = new Set([
  'String',
  'Boolean',
  'Int',
  'Float',
  'Enum',
  'ID',
]);

/**
 *
 * @param {number} [len=12]
 * @return {string}
 */
export const randomName = (len = 12) => {
  let ret = '';

  ret += LETTERS[Math.floor(Math.random() * LETTERS_LEN)];

  for (let i = len - 2; i >= 0; i--)
    ret += ALL_CHARS[Math.floor(Math.random() * ALL_CHARS_LEN)];

  return ret;
};

const getDeepestFieldSelection = fragment => {
  let currentNode = fragment;
  let fieldSelection;
  
  /* eslint-disable no-cond-assign */
  while (
    fieldSelection = currentNode.selectionSet
      ? currentNode.selectionSet.selections.find(
        selection => selection.kind === 'Field',
      )
      : null
  ) currentNode = fieldSelection;
  /* eslint-enable no-cond-assign */
  
  return currentNode;
};

const getSelectionByPath = (fragment, path) => {
  let currentNode = fragment;
  
  path.forEach(field => {
    const selection = currentNode.selectionSet.selections.find(selection =>
      selection.kind === 'Field' && selection.name.value === field);
    
    if (!selection) throw new Error('getSelectionByPath(): bad path');
    currentNode = selection;
  });
  
  return currentNode;
};

const attachFragmentToFragment = (
  fragment,
  destinationFragment,
  path = null,
) => {
  const selectionNode = path
    ? getSelectionByPath(destinationFragment, path)
    : getDeepestFieldSelection(destinationFragment);

  if (!selectionNode.selectionSet) {
    selectionNode.selectionSet = {
      kind: 'SelectionSet',
      selections: [],
    };
  }
  
  selectionNode.selectionSet.selections.push({
    kind: 'FragmentSpread',
    name: {
      kind: 'Name',
      value: fragment.name.value,
    },
    directives: [],
  });

  return destinationFragment;
};

const addTypenameField = fragment => {
  const selectionNode = getDeepestFieldSelection(fragment);
  
  if (!selectionNode.selectionSet) {
    selectionNode.selectionSet = {
      kind: 'SelectionSet',
      selections: [],
    };
  }
  
  selectionNode.selectionSet.selections.push({
    kind: 'Field',
    alias: null,
    name: {
      kind: 'Name',
      value: '__typename',
    },
    arguments: [],
    directives: [],
    selectionSet: null,
  });
  
  return fragment;
};

/**
 *
 * @param {Object} propValue - Prop value with 'data' source
 * @param {Object} dataContextTree
 * @return {string} - GraphQL type
 */
const resolveGraphQLType = (propValue, dataContextTree) => {
  const context = propValue.sourceData.dataContext.reduce(
    (acc, cur) => acc.children.get(cur),
    dataContextTree,
  );

  return context.type;
};

const toGraphQLScalarValue = (value, type) => {
  if (type === 'String') return { kind: 'StringValue', value };
  if (type === 'Int') return { kind: 'IntValue', value: `${value}` };
  if (type === 'Float') return { kind: 'FloatValue', value: `${value}` };
  if (type === 'Boolean') return { kind: 'BooleanValue', value };
  if (type === 'ID') return { kind: 'StringValue', value };

  throw new Error(`toGraphQLScalarValue(): Unknown type: '${type}'.`);
};

const buildGraphQLValue = (jssyValue, schemaTypeDef) => {
  // eslint-disable-next-line no-unused-vars
  const { type, kind, nonNull } = schemaTypeDef;

    // TODO: Deal with more complex values
  if (jssyValue.source === 'static') {
    if (jssyValue.sourceData.ownerPropName)
      return NO_VALUE;
    else if (jssyValue.sourceData.value === null)
      return NO_VALUE;
    else if (List.isList(jssyValue.sourceData.value))
      return NO_VALUE;
    else if (Map.isMap(jssyValue.sourceData.value))
      return NO_VALUE;
    else
      return toGraphQLScalarValue(jssyValue.sourceData.value, type);
  } else {
    return NO_VALUE;
  }
};

/**
 *
 * @param {string} argName
 * @param {Object} argValue
 * @param {Object} fieldDefinition
 * @return {Object}
 */
const buildGraphQLArgument = (argName, argValue, fieldDefinition) => {
  const argDefinition = fieldDefinition.args[argName];
  const value = buildGraphQLValue(argValue, argDefinition);

  return value === NO_VALUE ? NO_VALUE : {
    kind: 'Argument',
    name: { kind: 'Name', value: argName },
    value,
  };
};

/**
 *
 * @param {string} fieldName
 * @param {Object} jssyValue
 * @return {string}
 */
const getDataFieldKey = (fieldName, jssyValue) =>
  `${fieldName}${jssyValue.sourceData.aliasPostfix}`;

/**
 *
 * @param {string} fieldName
 * @param {Object} jssyValue
 * @return {Object}
 */
const buildAlias = (fieldName, jssyValue) => ({
  kind: 'Name',
  value: getDataFieldKey(fieldName, jssyValue),
});

/**
 *
 * @param {Object} jssyValue
 * Actually it's Immutable.Record; see models/ProjectComponentProp
 * @param {DataSchema} schema
 * @param {Object} dataContextTree
 * @return {Object}
 */
const buildGraphQLFragmentForValue = (jssyValue, schema, dataContextTree) => {
  const fragmentName = randomName();
  const onType = resolveGraphQLType(jssyValue, dataContextTree);

  const ret = {
    kind: 'FragmentDefinition',
    name: {
      kind: 'Name',
      value: fragmentName,
    },
    typeCondition: {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: onType,
      },
    },
    directives: [],
    selectionSet: null,
  };

  let currentNode = ret;
  let currentType = onType;
  let badPath = false;

  /* eslint-disable consistent-return */
  //noinspection JSCheckFunctionSignatures
  jssyValue.sourceData.queryPath.forEach((step, idx) => {
    const [fieldName, connectionFieldName] = step.field.split('/');
    const currentTypeDefinition = schema.types[currentType];
    const currentFieldDefinition = currentTypeDefinition.fields[fieldName];

    if (!currentFieldDefinition) {
      badPath = true;
      return false;
    }

    if (connectionFieldName) {
      if (currentFieldDefinition.kind !== FieldKinds.CONNECTION) {
        throw new Error(
          'Got slash field in path, but the field is not a connection',
        );
      }

      const args = [];
      const argumentValues = jssyValue.getQueryStepArgValues(idx);

      if (argumentValues) {
        argumentValues.forEach((argValue, argName) => {
          const arg = buildGraphQLArgument(
            argName,
            argValue,

            currentTypeDefinition
              .fields[fieldName]
              .connectionFields[connectionFieldName],
          );

          if (arg !== NO_VALUE) args.push(arg);
        });
      }

      const node = {
        kind: 'Field',
        alias: buildAlias(fieldName, jssyValue),
        name: {
          kind: 'Name',
          value: fieldName,
        },
        arguments: [],
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [{
            kind: 'Field',
            alias: buildAlias(connectionFieldName, jssyValue),
            name: {
              kind: 'Name',
              value: connectionFieldName,
            },
            arguments: args,
            directives: [],
            selectionSet: null,
          }],
        },
      };

      currentNode.selectionSet = {
        kind: 'SelectionSet',
        selections: [node],
      };

      currentNode = node.selectionSet.selections[0];
    } else if (currentFieldDefinition.kind === FieldKinds.CONNECTION) {
      // TODO: Handle connection arguments

      const node = {
        kind: 'Field',
        alias: buildAlias(fieldName, jssyValue),
        name: {
          kind: 'Name',
          value: fieldName,
        },
        arguments: [],
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [{
            kind: 'Field',
            alias: null,
            name: {
              kind: 'Name',
              value: 'edges',
            },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{
                kind: 'Field',
                alias: null,
                name: {
                  kind: 'Name',
                  value: 'node',
                },
                arguments: [],
                directives: [],
                selectionSet: null,
              }],
            },
          }],
        },
      };

      currentNode.selectionSet = {
        kind: 'SelectionSet',
        selections: [node],
      };

      currentNode = node.selectionSet.selections[0].selectionSet.selections[0];
    } else {
      const args = [];
      const argumentValues = jssyValue.getQueryStepArgValues(idx);

      if (argumentValues) {
        argumentValues.forEach((argValue, argName) => {
          const arg = buildGraphQLArgument(
            argName,
            argValue,
            currentTypeDefinition.fields[fieldName],
          );

          if (arg !== NO_VALUE) args.push(arg);
        });
      }

      const node = {
        kind: 'Field',
        alias: buildAlias(fieldName, jssyValue),
        name: {
          kind: 'Name',
          value: fieldName,
        },
        arguments: args,
        directives: [],
        selectionSet: null,
      };

      currentNode.selectionSet = {
        kind: 'SelectionSet',
        selections: [node],
      };

      currentNode = node;
    }

    currentType = getTypeNameByField(schema, step.field, currentType);
  });
  /* eslint-enable consistent-return */

  if (badPath) return null;

  ret[IS_FINISHED_FRAGMENT] = SCALAR_TYPES.has(currentType);
  return ret;
};

const DataContextTreeNode = Record({
  type: '',
  fragment: null,
  children: Map(),
});

const getDataContextTreeNode = (rootNode, propValue) =>
  rootNode.getIn([].concat(...propValue.sourceData.dataContext.map(
    context => ['children', context],
  )));

const getDataContextTreePath = (rootNode, propValue) =>
  propValue.sourceData.dataContext.reduce(
    (acc, cur) => acc.push(acc.last().getIn(['children', cur])),
    List([rootNode]),
  );

const pushDataContext = (
  dataContextTree,
  propValue,
  propMeta,
  fragment,
  schema,
  startType = schema.queryTypeName,
) => {
  const newDataContextNode = new DataContextTreeNode({
    type: getTypeNameByPath(
      schema,
      propValue.sourceData.queryPath.map(step => step.field),
      startType,
    ),

    fragment,
  });

  const path = [].concat(
    ...propValue.sourceData.dataContext.map(
      dataContextId => ['children', dataContextId],
    ),

    'children',
  );

  return dataContextTree.updateIn(path, children =>
    children.set(
      propMeta.sourceConfigs.data.pushDataContext,
      newDataContextNode,
    ),
  );
};

const buildAndAttachFragmentsForDesignerProp = (
  value,
  typedef,
  dataValuesByDataContext,
  dataContextTree,
  theMap,
  meta,
  schema,
  project,
) => {
  if (!typedef.sourceConfigs.designer.props) return { fragments: [], theMap };

  let usesDataContexts = false;

  _forOwn(typedef.sourceConfigs.designer.props, (
    ownerPropMeta,
    ownerPropName,
  ) => {
    if (ownerPropMeta.dataContext) {
      const dataPropValue = dataValuesByDataContext[ownerPropMeta.dataContext];

      if (dataPropValue) {
        usesDataContexts = true;

        const node = getDataContextTreeNode(dataContextTree, dataPropValue);

        theMap = theMap.update(value, data => Object.assign(data || {}, {
          [ownerPropMeta.dataContext]: {
            ownerPropName,
            type: node.children.get(ownerPropMeta.dataContext).type,
          },
        }));
      }
    }
  });

  if (!usesDataContexts) return { fragments: [], theMap };

  const fragments = [];

  const visitComponent = component => {
    // eslint-disable-next-line no-use-before-define
    const ret = buildGraphQLFragmentsForOwnComponent(
      component,
      schema,
      meta,
      project,
      dataContextTree,
      theMap,
    );

    ret.fragments.forEach(fragment => void fragments.push(fragment));
    theMap = ret.theMap;
  };

  walkComponentsTree(
    value.sourceData.components,
    value.sourceData.rootId,
    visitComponent,
  );

  return { fragments, theMap };
};

/**
 *
 * @param {Object} component
 * Actually it's an Immutable.Record; see models/ProjectComponent.js
 * @param {DataSchema} schema
 * @param {Object} meta
 * @param {Object} project
 * @param {Object} dataContextTree
 * @param {Object} theMap
 * @return {Object}
 */
const buildGraphQLFragmentsForOwnComponent = (
  component,
  schema,
  meta,
  project,
  dataContextTree,
  theMap,
) => {
  const componentMeta = getComponentMeta(component.name, meta);
  const fragments = [];
  const designerPropsWithComponent = [];
  const dataValuesByDataContext = {};

  const walkSimplePropsOptions = {
    project,
    walkFunctionArgs: true,
  };

  const visitProp = (value, typedef) => {
    if (value.isLinkedWithData()) {
      if (value.sourceData.dataContext.size === 0) return;

      const fragment = buildGraphQLFragmentForValue(
        value,
        schema,
        dataContextTree,
      );

      fragments.push(fragment);

      const dataContextTreeNode =
        getDataContextTreeNode(dataContextTree, value);

      const parentFragment = dataContextTreeNode.fragment;

      attachFragmentToFragment(fragment, parentFragment);
      
      if (fragment[IS_FINISHED_FRAGMENT]) {
        const path = getDataContextTreePath(dataContextTree, value);
        
        // Skipping root node because it doesn't contain a fragment
        path.rest().forEach(node => {
          node.fragment[IS_FINISHED_FRAGMENT] = true;
        });
      }

      const hasDataContext =
        isJssyValueDefinition(typedef) &&
        valueHasDataContest(typedef);

      if (hasDataContext) {
        dataValuesByDataContext[typedef.sourceConfigs.data.pushDataContext] =
          value;

        dataContextTree = pushDataContext(
          dataContextTree,
          value,
          typedef,
          fragment,
          schema,
          dataContextTreeNode.type,
        );
      }
    } else if (value.hasDesignedComponent()) {
      designerPropsWithComponent.push({
        value,
        typedef,
      });
    }
  };

  walkSimpleProps(component, componentMeta, visitProp, walkSimplePropsOptions);

  if (designerPropsWithComponent.length > 0) {
    designerPropsWithComponent.forEach(({ value, typedef }) => {
      const ret = buildAndAttachFragmentsForDesignerProp(
        value,
        typedef,
        dataValuesByDataContext,
        dataContextTree,
        theMap,
        meta,
        schema,
        project,
      );

      theMap = ret.theMap;
      ret.fragments.forEach(fragment => void fragments.push(fragment));
    });
  }

  return { fragments, theMap };
};

const fixUnfinishedFragments = fragments => {
  fragments.forEach(fragment => {
    if (!fragment[IS_FINISHED_FRAGMENT]) {
      addTypenameField(fragment);
      fragment[IS_FINISHED_FRAGMENT] = true;
    }
  });
  
  return fragments;
};

/**
 *
 * @param {Object} component
 * Actually it's an Immutable.Record; see models/ProjectComponent.js
 * @param {DataSchema} schema
 * @param {Object} meta
 * @param {Object} project
 * @return {Object}
 */
const buildGraphQLFragmentsForComponent = (
  component,
  schema,
  meta,
  project,
) => {
  const componentMeta = getComponentMeta(component.name, meta);
  const fragments = [];
  const designerPropsWithComponent = [];

  let dataContextTree = new DataContextTreeNode({
    type: schema.queryTypeName,
    children: Map(),
  });

  const dataValuesByDataContext = {};
  const walkSimplePropsOptions = { project, walkFunctionArgs: true };

  const visitValue = (value, typedef) => {
    if (value.isLinkedWithData()) {
      if (value.sourceData.dataContext.size !== 0) return;

      const fragment = buildGraphQLFragmentForValue(
        value,
        schema,
        dataContextTree,
      );

      fragments.push(fragment);

      const hasDataContext =
        isJssyValueDefinition(typedef) &&
        valueHasDataContest(typedef);

      if (hasDataContext) {
        dataValuesByDataContext[typedef.sourceConfigs.data.pushDataContext] =
          value;

        dataContextTree = pushDataContext(
          dataContextTree,
          value,
          typedef,
          fragment,
          schema,
        );
      }
    } else if (value.hasDesignedComponent()) {
      designerPropsWithComponent.push({
        value,
        typedef,
      });
    }
  };

  walkSimpleProps(component, componentMeta, visitValue, walkSimplePropsOptions);

  let theMap = Map();

  if (designerPropsWithComponent.length > 0) {
    designerPropsWithComponent.forEach(({ value, typedef }) => {
      const ret = buildAndAttachFragmentsForDesignerProp(
        value,
        typedef,
        dataValuesByDataContext,
        dataContextTree,
        theMap,
        meta,
        schema,
        project,
      );

      theMap = ret.theMap;
      ret.fragments.forEach(fragment => void fragments.push(fragment));
    });
  }

  return { fragments: fixUnfinishedFragments(fragments), theMap };
};

export const buildQueryForComponent = (component, schema, meta, project) => {
  const { fragments, theMap } =
    buildGraphQLFragmentsForComponent(component, schema, meta, project);
  
  const isRootFragment = fragment =>
    fragment.typeCondition.name.value === schema.queryTypeName;

  const rootFragments = fragments.filter(isRootFragment);

  if (!rootFragments.length) return { query: null, theMap };

  const query = {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        name: {
          kind: 'Name',
          value: randomName(),
        },
        variableDefinitions: [],
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: rootFragments.map(fragment => ({
            kind: 'FragmentSpread',
            name: {
              kind: 'Name',
              value: fragment.name.value,
            },
            directives: [],
          })),
        },
      },

      ...fragments,
    ],
  };

  return { query, theMap };
};

/**
 *
 * @param {Object} jssyValue
 * @param {Object} data
 * @param {DataSchema} schema
 * @param {string} [rootType]
 * @return {*|NO_VALUE}
 */
export const extractPropValueFromData = (
  jssyValue,
  data,
  schema,
  rootType = schema.queryTypeName,
) => jssyValue.sourceData.queryPath.reduce((acc, queryStep) => {
  if (acc.data === null || acc.data === NO_VALUE) {
    return {
      data: NO_VALUE,
      type: '',
    };
  }
  
  const typeDefinition = schema.types[acc.type];
  const { fieldName, connectionFieldName } = parseFieldName(queryStep.field);
  const fieldDefinition = typeDefinition.fields[fieldName];
  const fieldKey = getDataFieldKey(fieldName, jssyValue);

  if (fieldDefinition.kind === FieldKinds.CONNECTION) {
    if (connectionFieldName) {
      const connectionFieldKey =
        getDataFieldKey(connectionFieldName, jssyValue);
      
      return {
        data: acc.data[fieldKey][connectionFieldKey],
        type: fieldDefinition.connectionFields[connectionFieldName].type,
      };
    } else {
      return {
        data: acc.data[fieldKey].edges.map(edge => edge.node),
        type: fieldDefinition.type,
      };
    }
  } else {
    return {
      data: acc.data[fieldKey],
      type: fieldDefinition.type,
    };
  }
}, { data, type: rootType }).data;

/**
 *
 * @param {DataFieldTypeDefinition} typeDefinition
 * @return {Object}
 */
const typeDefinitionToGQLTypeAST = typeDefinition => {
  let ret = {
    kind: 'NamedType',
    name: {
      kind: 'Name',
      value: typeDefinition.type,
    },
  };
  
  const kindError =
    typeDefinition.kind !== FieldKinds.SINGLE &&
    typeDefinition.kind !== FieldKinds.LIST;
  
  if (kindError) {
    throw new Error(
      'typeDefinitionToGQLTypeAST(): ' +
      'Only types of kinds SINGLE and LIST are supported',
    );
  }
  
  if (typeDefinition.kind === FieldKinds.LIST) {
    if (typeDefinition.nonNullMember) {
      ret = {
        kind: 'NonNullType',
        type: ret,
      };
    }
    
    ret = {
      kind: 'ListType',
      type: ret,
    };
  }
  
  if (typeDefinition.nonNull) {
    ret = {
      kind: 'NonNullType',
      type: ret,
    };
  }
  
  return ret;
};

/**
 *
 * @type {Map<DataSchema, Map<string, Object>>}
 */
const mutationsCacheBySchema = new window.Map();

/**
 *
 * @param {DataSchema} schema
 * @param {string} mutationName
 * @return {?Object}
 */
const getMutationFromCache = (schema, mutationName) => {
  const mutationsBySchema = mutationsCacheBySchema.get(schema);
  if (!mutationsBySchema) return null;
  const mutation = mutationsBySchema.get(mutationName);
  return mutation || null;
};

/**
 *
 * @param {DataSchema} schema
 * @param {string} mutationName
 * @param {Object} mutation
 */
const saveMutationToCache = (schema, mutationName, mutation) => {
  let mutationsBySchema = mutationsCacheBySchema.get(schema);
  if (!mutationsBySchema) {
    mutationsBySchema = new window.Map();
    mutationsCacheBySchema.set(schema, mutationsBySchema);
  }
  
  mutationsCacheBySchema.set(mutationName, mutation);
};

/**
 *
 * @param {?Object} selections
 * @return {Object[]}
 */
const selectionsToAST = selections => {
  if (!selections) return [];
  
  return objectToArray(
    selections,
  
    (value, key) => ({
      kind: 'Field',
      alias: null,
      name: {
        kind: 'Name',
        value: key,
      },
      arguments: [],
      directives: [],
      selectionSet: typeof value === 'object'
        ? {
          kind: 'SelectionSet',
          selections: selectionsToAST(value),
        }
        : null,
    }),
  );
};

/**
 *
 * @param {DataSchema} schema
 * @param {string} typeName
 * @return {boolean}
 */
const isScalarType = (schema, typeName) =>
  isBuiltinGraphQLType(typeName) ||
  schema.customScalarTypes.indexOf(typeName) !== -1;

/**
 *
 * @param {DataSchema} schema
 * @param {string} mutationName
 * @param {?Object} [selections=null]
 * @return {?Object}
 */
export const buildMutation = (schema, mutationName, selections = null) => {
  const cached = getMutationFromCache(schema, mutationName);
  if (cached) return cached;
  
  const mutationField = getMutationField(schema, mutationName);
  if (!mutationField) return null;
  
  const ret = {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'mutation',
        name: {
          kind: 'Name',
          value: randomName(),
        },
        variableDefinitions: objectToArray(
          mutationField.args,
          
          (arg, argName) => ({
            kind: 'VariableDefinition',
            variable: {
              kind: 'Variable',
              name: {
                kind: 'Name',
                value: argName,
              },
            },
            type: typeDefinitionToGQLTypeAST(arg),
            defaultValue: null,
          }),
        ),
        directives: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [{
            kind: 'Field',
            alias: null,
            name: {
              kind: 'Name',
              value: mutationName,
            },
            arguments: objectToArray(mutationField.args, (_, argName) => ({
              kind: 'Argument',
              name: {
                kind: 'Name',
                value: argName,
              },
              value: {
                kind: 'Variable',
                name: {
                  kind: 'Name',
                  value: argName,
                },
              },
            })),
            directives: [],
            selectionSet: isScalarType(schema, mutationField.type)
              ? null
              : {
                kind: 'SelectionSet',
                selections: [...selectionsToAST(selections), {
                  kind: 'Field',
                  alias: null,
                  name: {
                    kind: 'Name',
                    value: '__typename',
                  },
                  arguments: [],
                  directives: [],
                  selectionSet: null,
                }],
              },
          }],
        },
      },
    ],
  };
  
  saveMutationToCache(schema, mutationName, ret);
  return ret;
};
