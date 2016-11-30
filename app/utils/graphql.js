/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { NO_VALUE } from '../constants/misc';
import { getTypeNameByField, FIELD_KINDS } from './schema';
import { getComponentMeta } from './meta';

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
        (acc, cur) => acc.children[cur],
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
 * @typedef {Object} DataContextTreeNode
 * @property {string} type
 * @property {Object<string, DataContextTreeNode>} children
 */

/**
 * @typedef {DataContextTreeNode} DataContextTree
 */

/**
 *
 * @param {Object} propValue - Actually it's Immutable.Record; see models/ProjectComponentProp
 * @param {string} fragmentName
 * @param {DataSchema} schema
 * @param {DataContextTree} dataContextTree
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

/**
 *
 * @param {Object} component - Actually it's an Immutable.Record; see models/ProjectComponent
 * @param {DataSchema} schema
 * @param {DataContextTree} dataContextTree
 * @return {Object[]}
 */
export const buildGraphQLFragmentsForComponent = (component, schema, dataContextTree) => {
    const componentMeta = getComponentMeta(component.name, this.props.meta);

    const ret = [];

    const visitValue = (value, typedef) => {
        if (value.source === 'data') {
            ret.push(buildGraphQLFragment(value, randomName(), schema, dataContextTree));
        }
        else if (value.source === 'static' && !value.sourceData.ownerPropName) {
            if (typedef.type === 'shape' && value.sourceData.value !== null) {
                objectForEach(typedef.fields, (fieldTypedef, fieldName) =>
                    void visitValue(value.sourceData.value[fieldName], fieldTypedef));
            }
            else if (typedef.type === 'objectOf' && value.sourceData.value !== null) {
                value.sourceData.value.forEach(fieldValue =>
                    void visitValue(fieldValue, typedef.ofType));
            }
            else if (typedef.type === 'arrayOf') {
                value.sourceData.value.forEach(itemValue =>
                    void visitValue(itemValue, typedef.ofType));
            }
        }
    };

    component.props.forEach((propValue, propName) =>
        void visitValue(propValue, componentMeta.props[propName]));

    return ret;
};
