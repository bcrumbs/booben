/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, Map } from 'immutable';

import { NO_VALUE } from '../constants/misc';
import { getTypeNameByField, getTypeNameByPath, FIELD_KINDS } from './schema';
import { getComponentMeta } from './meta';
import { objectForEach } from './misc';

const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '1234567890';
const LETTERS = UPPERCASE_LETTERS + LOWERCASE_LETTERS;
const LETTERS_LEN = LETTERS.length;
const ALL_CHARS = LETTERS + NUMBERS;
const ALL_CHARS_LEN = ALL_CHARS.length;

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

/**
 *
 * @param {Object} propValue - Prop value with 'data' source
 * @param {Object} dataContextTree
 * @return {string} - GraphQL type
 */
const resolveGraphQLType = (propValue, dataContextTree) => {
    const context = propValue.sourceData.dataContext.reduce(
        (acc, cur) => acc.children.get(cur),
        dataContextTree
    );

    return context.type;
};

/**
 *
 * @param {Object} propValue - Actually it's Immutable.Record; see models/ProjectComponentProp
 * @param {string} type
 * @param {string} kind
 * @return {Object|NO_VALUE}
 */
const buildGraphQLValue = (propValue, type, kind) => {
    // TODO: Deal with values
    if (propValue.source === 'static') {
        if (propValue.sourceData.ownerPropName) {
            return NO_VALUE;
        }
        else {
            return NO_VALUE;
        }
    }
    else {
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
    const value = buildGraphQLValue(
        argValue,
        fieldDefinition.type,
        fieldDefinition.kind
    );

    return value === NO_VALUE ? NO_VALUE : {
        kind: 'Argument',
        name: { kind: 'Name', value: argName },
        value
    };
};

/**
 *
 * @param {Object} propValue - Actually it's Immutable.Record; see models/ProjectComponentProp
 * @param {string} fragmentName
 * @param {DataSchema} schema
 * @param {Object} dataContextTree
 * @return {Object}
 */
const buildGraphQLFragment = (propValue, fragmentName, schema, dataContextTree) => {
    const onType = resolveGraphQLType(propValue, dataContextTree);

    const ret = {
        kind: 'FragmentDefinition',
        name: {
            kind: 'Name',
            value: fragmentName
        },
        typeCondition: {
            kind: 'NamedType',
            name: {
                kind: 'Name',
                value: onType
            }
        },
        directives: [],
        selectionSet: null
    };

    let currentNode = ret,
        currentType = onType;

    propValue.sourceData.queryPath.forEach(step => {
        const [fieldName, connectionFieldName] = step.field.split('/'),
            currentTypeDefinition = schema.types[currentType],
            currentFieldDefinition = currentTypeDefinition.fields[fieldName];

        if (connectionFieldName) {
            if (currentFieldDefinition.kind !== FIELD_KINDS.CONNECTION) {
                throw new Error(
                    'Got slash field in path, but the field is not a connection'
                );
            }

            const args = [];

            if (step.args) {
                step.args.forEach((argValue, argName) => {
                    const arg = buildGraphQLArgument(
                        argName,
                        argValue,
                        currentTypeDefinition
                            .fields[fieldName]
                            .connectionFields[connectionFieldName]
                    );

                    if (arg !== NO_VALUE) args.push(arg);
                });
            }

            const node = {
                kind: 'Field',
                alias: null,
                name: {
                    kind: 'Name',
                    value: fieldName
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
                            value: connectionFieldName
                        },
                        arguments: args,
                        directives: [],
                        selectionSet: null
                    }]
                }
            };

            currentNode.selectionSet = {
                kind: 'SelectionSet',
                selections: [node]
            };

            currentNode = node.selectionSet.selections[0];
        }
        else if (currentFieldDefinition.kind !== FIELD_KINDS.CONNECTION) {
            // TODO: Handle connection arguments

            const node = {
                kind: 'Field',
                alias: null,
                name: {
                    kind: 'Name',
                    value: fieldName
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
                            value: 'edges'
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
                                    value: 'node'
                                },
                                arguments: [],
                                directives: [],
                                selectionSet: null
                            }]
                        }
                    }]
                }
            };

            currentNode.selectionSet = {
                kind: 'SelectionSet',
                selections: [node]
            };

            currentNode = node.selectionSet.selections[0].selectionSet.selections[0];
        }
        else {
            const args = [];

            if (step.args) {
                step.args.forEach((argValue, argName) => {
                    const arg = buildGraphQLArgument(
                        argName,
                        argValue,
                        currentTypeDefinition.fields[fieldName]
                    );

                    if (arg !== NO_VALUE) args.push(arg);
                });
            }

            const node = {
                kind: 'Field',
                alias: null,
                name: {
                    kind: 'Name',
                    value: fieldName
                },
                arguments: args,
                directives: [],
                selectionSet: null
            };

            currentNode.selectionSet = {
                kind: 'SelectionSet',
                selections: [node]
            };

            currentNode = node;
        }

        currentType = getTypeNameByField(
            schema,
            step.field,
            currentType
        );
    });

    return ret;
};

const DataContextTreeNode = Record({
    type: '',
    fragmentId: -1,
    children: Map()
});

/**
 *
 * @param {Object} component - Actually it's an Immutable.Record; see models/ProjectComponent.js
 * @param {DataSchema} schema
 * @return {Object[]}
 */
export const buildGraphQLFragmentsForComponent = (component, schema) => {
    const componentMeta = getComponentMeta(component.name, this.props.meta);

    let dataContextTree = new DataContextTreeNode({
        type: schema.queryTypeName,
        children: Map()
    });

    const ret = [];

    const designerPropsWithComponent = [];

    const visitValue = (propValue, typedef) => {
        if (propValue.source === 'data') {
            const fragment = buildGraphQLFragment(
                propValue,
                randomName(),
                schema,
                dataContextTree
            );

            const fragmentId = ret.push(fragment) - 1;

            if (typedef.sourceConfigs.data.pushDataContext) {
                const newDataContextNode = new DataContextTreeNode({
                    type: getTypeNameByPath(
                        schema,
                        propValue.sourceData.queryPath.map(step => step.field)
                    ),

                    fragmentId
                });

                dataContextTree = dataContextTree.update('children', children =>
                    children.set(
                        typedef.sourceConfigs.data.pushDataContext,
                        newDataContextNode
                    )
                );
            }
        }
        else if (propValue.source === 'static' && !propValue.sourceData.ownerPropName) {
            if (typedef.type === 'shape' && propValue.sourceData.value !== null) {
                objectForEach(typedef.fields, (fieldTypedef, fieldName) =>
                    void visitValue(propValue.sourceData.value[fieldName], fieldTypedef));
            }
            else if (typedef.type === 'objectOf' && propValue.sourceData.value !== null) {
                propValue.sourceData.value.forEach(fieldValue =>
                    void visitValue(fieldValue, typedef.ofType));
            }
            else if (typedef.type === 'arrayOf') {
                propValue.sourceData.value.forEach(itemValue =>
                    void visitValue(itemValue, typedef.ofType));
            }
        }
        else if (propValue.source === 'designer' && propValue.sourceData.rootId > -1) {
            designerPropsWithComponent.push({
                propValue,
                typedef
            });
        }
    };

    component.props.forEach((propValue, propName) =>
        void visitValue(propValue, componentMeta.props[propName]));

    designerPropsWithComponent.forEach(({ propValue, typedef }) => {
        // TODO: Attach fragments to fragments
    });

    return ret;
};
