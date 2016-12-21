/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import _set from 'lodash.set';
import _forOwn from 'lodash.forown';
import { Record, Map, List } from 'immutable';
import { NO_VALUE } from '../constants/misc';
import { walkSimpleProps, walkComponentsTree } from '../models/ProjectComponent';
import { getTypeNameByField, getTypeNameByPath, FIELD_KINDS } from './schema';
import { getComponentMeta, propHasDataContest } from './meta';

const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '1234567890';
const LETTERS = UPPERCASE_LETTERS + LOWERCASE_LETTERS;
const LETTERS_LEN = LETTERS.length;
const ALL_CHARS = LETTERS + NUMBERS;
const ALL_CHARS_LEN = ALL_CHARS.length;

const IS_FINISHED_FRAGMENT = Symbol();

const SCALAR_TYPES = new Set([
  'String',
  'Boolean',
  'Int',
  'Float',
  'Enum',
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

const attachFragmentToFragment = (fragment, destinationFragment, path = null) => {
  let currentNode = destinationFragment;

  if (path) {
    path.forEach(field => {
      const selection = currentNode.selectionSet.selections.find(
                selection => selection.kind === 'Field' && selection.name.value === field,
            );

      if (selection)
        currentNode = selection;

      else
                throw new Error('attachFragmentToFragment(): bad path');
    });
  } else {
    let fieldSelection;

    while (
            fieldSelection = currentNode.selectionSet
                ? currentNode.selectionSet.selections.find(
                    selection => selection.kind === 'Field',
                )
                : null
        )
      currentNode = fieldSelection;
  }

  if (!currentNode.selectionSet) {
    currentNode.selectionSet = {
      kind: 'SelectionSet',
      selections: [],
    };
  }

  currentNode.selectionSet.selections.push({
    kind: 'FragmentSpread',
    name: {
      kind: 'Name',
      value: fragment.name.value,
    },
    directives: [],
  });

  if (fragment[IS_FINISHED_FRAGMENT]) destinationFragment[IS_FINISHED_FRAGMENT] = true;
  return destinationFragment;
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
  if (type === 'ID') return { kind: 'StringValue', value }; // ???

  throw new Error(`toGraphQLScalarValue(): Unknown type: '${type}'.`);
};

const buildGraphQLValue = (propValue, schemaTypeDef) => {
  const { type, kind, nonNull } = schemaTypeDef;

    // TODO: Deal with more complex values
  if (propValue.source === 'static') {
    if (propValue.sourceData.ownerPropName)
      return NO_VALUE;

    else if (propValue.sourceData.value === null)
      return NO_VALUE;

    else if (List.isList(propValue.sourceData.value))
      return NO_VALUE;

    else if (Map.isMap(propValue.sourceData.value))
      return NO_VALUE;

    else
            return toGraphQLScalarValue(propValue.sourceData.value, type);
  } else
        return NO_VALUE;
};

/**
 *
 * @param {string} argName
 * @param {Object} argValue
 * @param {Object} fieldDefinition
 * @return {Object}
 */
const buildGraphQLArgument = (argName, argValue, fieldDefinition) => {
  const argDefinition = fieldDefinition.args[argName],
    value = buildGraphQLValue(argValue, argDefinition);

  return value === NO_VALUE ? NO_VALUE : {
    kind: 'Argument',
    name: { kind: 'Name', value: argName },
    value,
  };
};

const getQueryStepArgValues = (component, ownerComponentsChain, propValue, stepIdx) => {
  const propDataContext = propValue.sourceData.dataContext,
    keyForDataContextArgs = propDataContext.join(' ');

  const keyForQueryArgs = propValue.sourceData.queryPath
        .slice(0, stepIdx + 1)
        .map(step => step.field)
        .join(' ');

  const componentWithQueryArgs = propDataContext.size === 0
        ? component
        : ownerComponentsChain[ownerComponentsChain.length - propDataContext.size];

  return componentWithQueryArgs.queryArgs.getIn([
    keyForDataContextArgs,
    keyForQueryArgs,
  ]);
};

/**
 *
 * @param {Object} component - Actually it's Immutable.Record; see models/ProjectComponent
 * @param {Object[]} ownerComponentsChain
 * @param {Object} propValue - Actually it's Immutable.Record; see models/ProjectComponentProp
 * @param {string} fragmentName
 * @param {DataSchema} schema
 * @param {Object} dataContextTree
 * @return {Object}
 */
const buildGraphQLFragmentForValue = (
    component,
    ownerComponentsChain,
    propValue,
    fragmentName,
    schema,
    dataContextTree,
) => {
  const onType = resolveGraphQLType(propValue, dataContextTree);

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

  let currentNode = ret,
    currentType = onType,
    badPath = false;

    // noinspection JSCheckFunctionSignatures
  propValue.sourceData.queryPath.forEach((step, idx) => {
    const [fieldName, connectionFieldName] = step.field.split('/'),
      currentTypeDefinition = schema.types[currentType],
      currentFieldDefinition = currentTypeDefinition.fields[fieldName];

    if (!currentFieldDefinition) {
      badPath = true;
      return false;
    }

    if (connectionFieldName) {
      if (currentFieldDefinition.kind !== FIELD_KINDS.CONNECTION) {
        throw new Error(
                    'Got slash field in path, but the field is not a connection',
                );
      }

      const args = [];

      const argumentValues = getQueryStepArgValues(
                component,
                ownerComponentsChain,
                propValue,
                idx,
            );

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
        alias: null,
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
    } else if (currentFieldDefinition.kind === FIELD_KINDS.CONNECTION) {
            // TODO: Handle connection arguments

      const node = {
        kind: 'Field',
        alias: null,
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
      const args = [],
        argumentValues = getQueryStepArgValues(
                    component,
                    ownerComponentsChain,
                    propValue,
                    idx,
                );

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
        alias: null,
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

    currentType = getTypeNameByField(
            schema,
            step.field,
            currentType,
        );
  });

  if (badPath) return null;

  ret[IS_FINISHED_FRAGMENT] = SCALAR_TYPES.has(currentType);
  return ret;
};

const DataContextTreeNode = Record({
  type: '',
  fragment: null,
  children: Map(),
});

const getDataContextTreeNode = (dataContextTree, propValue) =>
    dataContextTree.getIn([].concat(
        ...propValue.sourceData.dataContext.map(
            context => ['children', context],
        ),
    ));

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
    propValue,
    propMeta,
    ownerComponentsChain,
    dataValuesByDataContext,
    dataContextTree,
    theMap,
    meta,
    schema,
) => {
  if (!propMeta.sourceConfigs.designer.props) return { fragments: [], theMap };

  let usesDataContexts = false;

  _forOwn(propMeta.sourceConfigs.designer.props, (ownerPropMeta, ownerPropName) => {
    if (ownerPropMeta.dataContext) {
      const dataPropValue = dataValuesByDataContext[ownerPropMeta.dataContext];

      if (dataPropValue) {
        usesDataContexts = true;

        const node = getDataContextTreeNode(dataContextTree, dataPropValue);

        theMap = theMap.update(propValue, data => Object.assign(data || {}, {
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
    const ret = buildGraphQLFragmentsForOwnComponent(
            component,
            ownerComponentsChain,
            schema,
            meta,
            dataContextTree,
            theMap,
        );

    ret.fragments.forEach(fragment => void fragments.push(fragment));
    theMap = ret.theMap;
  };

  walkComponentsTree(
        propValue.sourceData.components,
        propValue.sourceData.rootId,
        visitComponent,
    );

  return { fragments, theMap };
};

/**
 *
 * @param {Object} component - Actually it's an Immutable.Record; see models/ProjectComponent.js
 * @param {Object[]} ownerComponentsChain
 * @param {DataSchema} schema
 * @param {Object} meta
 * @param {Object} dataContextTree
 * @param {Object} theMap
 * @return {Object}
 */
const buildGraphQLFragmentsForOwnComponent = (
    component,
    ownerComponentsChain,
    schema,
    meta,
    dataContextTree,
    theMap,
) => {
  const componentMeta = getComponentMeta(component.name, meta),
    fragments = [],
    designerPropsWithComponent = [],
    dataValuesByDataContext = {};

  walkSimpleProps(component, componentMeta, (propValue, propMeta) => {
    if (propValue.source === 'data') {
      const isGoodProp =
                propValue.sourceData.queryPath !== null &&
                propValue.sourceData.dataContext.size > 0;

      if (!isGoodProp) return;

      const fragment = buildGraphQLFragmentForValue(
                component,
                ownerComponentsChain,
                propValue,
                randomName(),
                schema,
                dataContextTree,
            );

      fragments.push(fragment);

      const dataContextTreeNode = getDataContextTreeNode(
                dataContextTree,
                propValue,
            );

      const parentFragment = dataContextTreeNode.fragment;

      attachFragmentToFragment(fragment, parentFragment);

      if (propHasDataContest(propMeta)) {
        dataValuesByDataContext[propMeta.sourceConfigs.data.pushDataContext] =
                    propValue;

        dataContextTree = pushDataContext(
                    dataContextTree,
                    propValue,
                    propMeta,
                    fragment,
                    schema,
                    dataContextTreeNode.type,
                );
      }
    } else if (propValue.source === 'designer' && propValue.sourceData.rootId > -1) {
      designerPropsWithComponent.push({
        propValue,
        propMeta,
      });
    }
  });

  if (designerPropsWithComponent.length > 0) {
    designerPropsWithComponent.forEach(({ propValue, propMeta }) => {
      const ret = buildAndAttachFragmentsForDesignerProp(
                propValue,
                propMeta,
                [...ownerComponentsChain, component],
                dataValuesByDataContext,
                dataContextTree,
                theMap,
                meta,
                schema,
            );

      theMap = ret.theMap;
      ret.fragments.forEach(fragment => void fragments.push(fragment));
    });
  }

  return { fragments, theMap };
};

/**
 *
 * @param {Object} component - Actually it's an Immutable.Record; see models/ProjectComponent.js
 * @param {DataSchema} schema
 * @param {Object} meta
 * @return {Object}
 */
const buildGraphQLFragmentsForComponent = (
    component,
    schema,
    meta,
) => {
  const componentMeta = getComponentMeta(component.name, meta),
    fragments = [],
    designerPropsWithComponent = [];

  let dataContextTree = new DataContextTreeNode({
    type: schema.queryTypeName,
    children: Map(),
  });

  const dataValuesByDataContext = {};

  walkSimpleProps(component, componentMeta, (propValue, propMeta) => {
    if (propValue.source === 'data') {
      const isGoodProp =
                propValue.sourceData.queryPath !== null &&
                propValue.sourceData.dataContext.size === 0;

      if (!isGoodProp) return;

      const fragment = buildGraphQLFragmentForValue(
                component,
                [],
                propValue,
                randomName(),
                schema,
                dataContextTree,
            );

      fragments.push(fragment);

      if (propHasDataContest(propMeta)) {
        dataValuesByDataContext[propMeta.sourceConfigs.data.pushDataContext] =
                    propValue;

        dataContextTree = pushDataContext(
                    dataContextTree,
                    propValue,
                    propMeta,
                    fragment,
                    schema,
                );
      }
    } else if (propValue.source === 'designer' && propValue.sourceData.rootId > -1) {
      designerPropsWithComponent.push({
        propValue,
        propMeta,
      });
    }
  });

  let theMap = Map();

  if (designerPropsWithComponent.length > 0) {
    designerPropsWithComponent.forEach(({ propValue, propMeta }) => {
      const ret = buildAndAttachFragmentsForDesignerProp(
                propValue,
                propMeta,
                [component],
                dataValuesByDataContext,
                dataContextTree,
                theMap,
                meta,
                schema,
            );

      theMap = ret.theMap;
      ret.fragments.forEach(fragment => void fragments.push(fragment));
    });
  }

  return { fragments, theMap };
};

export const buildQueryForComponent = (component, schema, meta) => {
  const { fragments, theMap } =
        buildGraphQLFragmentsForComponent(component, schema, meta);

  const rootFragments = fragments.filter(fragment =>
        fragment.typeCondition.name.value === schema.queryTypeName &&
        fragment[IS_FINISHED_FRAGMENT],
    );

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
 * @param {Object} propValue
 * @param {Object} data
 * @param {DataSchema} schema
 * @param {string} [rootType]
 * @return {*}
 */
export const extractPropValueFromData = (
    propValue,
    data,
    schema,
    rootType = schema.queryTypeName,
) => propValue.sourceData.queryPath.reduce((acc, queryStep) => {
  const typeDefinition = schema.types[acc.type],
    [fieldName, connectionFieldName] = queryStep.field.split('/'),
    fieldDefinition = typeDefinition.fields[fieldName];

  if (fieldDefinition.kind === FIELD_KINDS.CONNECTION) {
    if (connectionFieldName) {
      return {
        data: acc.data[fieldName][connectionFieldName],
        type: fieldDefinition.connectionFields[connectionFieldName].type,
      };
    } else {
      return {
        data: acc.data[fieldName].edges.map(edge => edge.node),
        type: fieldDefinition.type,
      };
    }
  } else {
    return {
      data: acc.data[fieldName],
      type: fieldDefinition.type,
    };
  }
}, { data, type: rootType }).data;

export const mapDataToComponentProps = (component, data, schema, meta) => {
  const componentMeta = getComponentMeta(component.name, meta),
    ret = {};

  walkSimpleProps(component, componentMeta, (propValue, propMeta, path) => {
    if (propValue.source === 'data')
      _set(ret, path, extractPropValueFromData(propValue, data, schema));
  });

  return ret;
};
