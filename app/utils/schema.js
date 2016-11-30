/**
 * @author olegnn <olegnosov1@gmail.com>
 */

import { objectForEach } from './misc';

export const FIELD_KINDS = {
	SINGLE: 'SINGLE',
	LIST: 'LIST',
	CONNECTION: 'CONNECTION'
};

export const graphQLPrimitiveTypes = new Set([
	'Int',
	'Float',
	'Boolean',
	'String',
	'ID'
]);

/**
 *
 * @param {Object} type
 * @param {string} searchForTypeName
 * @return {boolean}
 */
const containType = (type, searchForTypeName) => {
	if (!type) return false;
	if (type.name === searchForTypeName) return true;
	else
		if (type.ofType)
			return containType(type.ofType, searchForTypeName);

	return false;
};

/**
 *
 * @param {Array<Object>} types
 * @param {string} searchForTypeName
 * @return {Array<Object>}
 */
const findAllDependentTypes = (types, searchForTypeName) =>
	types.reduce(
		(dependentTypes, currentType) =>
			dependentTypes.concat(
				currentType.fields
				&&	currentType.fields.some(
					({ type }) =>
						containType(type, searchForTypeName)
				)
				?	[currentType]
				:	[]
			)
	, []);

/**
 *
 * @param {Array<Object>} types
 * @return {Object<Object>}
 */
const getRelayConnections = types => {
	let connections = {};

	const nodeType = types.find(
		({ name, kind, fields }) =>
			name === 'Node'
			&&	kind === 'INTERFACE'
			&&	fields.find(
				({ type }) =>
					type.kind === 'NON_NULL'
					&&	type.ofType.name === 'ID'
			)
	);

	if (nodeType) {
		// TODO Refactor and optimize
		const { possibleTypes } = nodeType;

		possibleTypes.forEach(
			possibleNodeType => {
				const nodeDependentTypes = findAllDependentTypes(
					types,
					possibleNodeType.name
				);

				nodeDependentTypes.forEach(
					nodeDependentType => {
						if (nodeDependentType.fields.filter(
							({ name }) => ['cursor', 'node'].includes(name)
						).length === 2) {
							const edgeDependentTypes
								= findAllDependentTypes(types, nodeDependentType.name);

							edgeDependentTypes.forEach(
								edgeDependentType => {
									if (edgeDependentType.fields.find(
										({ name }) => name === 'pageInfo'
									))	connections[edgeDependentType.name] = {
											data: edgeDependentType,
											edge: nodeDependentType,
											node: possibleNodeType
										};
								}
							);
						}
					}
				);
			}
		);
	}
	return connections;
};

const convertToSchemaType = (type, getFieldDescription) => {
	const schemaType = {
		fields: type.fields && type.fields.reduce(
			(acc, field) => Object.assign(
				acc,
				{
					[field.name]: getFieldDescription(
						field
					)
				}
			)
		, {}),
		description: type.description || '',
		interfaces: type.interfaces && type.interfaces.length
					? type.interfaces.map(({ name }) => name)
					: []
	};
	return schemaType;
};

/**
 *
 * @param {Object} schema
 * @return {Object}
 */
export const parseGraphQLSchema = schema => {
	// TODO mutationType and subscriptionType
	const queryType = schema.types.find(({ name }) => name === schema.queryType.name);

	let normalizedTypes = {};

	const connections = getRelayConnections(schema.types);

	// -----------------------------------------------
	// TODO Correct and refactor

	const haveKind = (type, kind) =>
		kind === FIELD_KINDS['CONNECTION']
		?	!!connections[type.name]
		:	(
			type.kind === kind
			||	(
				type.ofType
				?	haveKind(type.ofType)
				:	false
			)
		);

	const getTypeDescription = (type, kind) =>
		kind === FIELD_KINDS['CONNECTION']
		?	{
				type: connections[type.name].node.name,
				connectionFields:
					connections[type.name].data
						.fields
							.filter(({ name }) => !['edges', 'pageInfo'].includes(name))
							.reduce((acc, field) => Object.assign(
								acc, {
									[field.name]: getFieldDescription(field)
								}
							), {})
			}
		:	(
			type.ofType
			?	getTypeDescription(type.ofType, kind)
			:  	{ type: type.name }
		);


	const getFieldDescription = (field) => {
		const kind = FIELD_KINDS[
			haveKind(field.type, 'LIST')
			?	'LIST'
			:	(
				haveKind(field.type, FIELD_KINDS['CONNECTION'])
				?	'CONNECTION'
				:	'SINGLE'
			)
		];

		return Object.assign({
			nonNull: haveKind(field.type, 'NON_NULL'),
			kind,
			description: field.description || '',
			args: field.args && field.args.length
					?	field.args.reduce(
							(acc, arg) => Object.assign(
								acc,
								{
									[arg.name]: Object.assign({},
										getFieldDescription(arg),
										{ defaultValue: arg.defaultValue || null }
									)
								}
							)
						, {})
					:	[]
		}, getTypeDescription(field.type, kind));
	};

	// -----------------------------------------------

	schema.types.forEach(
		type => {
			if (
				!graphQLPrimitiveTypes.has(type.name)
				&&	!/^__.*/.test(type.name)
				&&	type.kind !== 'INTERFACE'
			)
				normalizedTypes[type.name] = convertToSchemaType(
					type,
					getFieldDescription
				);
		}
	);

	objectForEach(connections,
		({ edge }, key) => {
			delete normalizedTypes[key];
			delete normalizedTypes[edge.name];
			if (normalizedTypes['PageInfo']) delete normalizedTypes['PageInfo'];
		}
	);

	return { types: normalizedTypes, queryTypeName: queryType.name };
};

/**
 *
 * @param {DataSchema} schema
 * @param {string} fieldName
 * @param {string} onType
 * @return {string}
 */
export const getTypeNameByField = (schema, fieldName, onType) => {
    const [ownFieldName, connectionFieldName] = fieldName.split('/');

    let field = schema.types[onType].fields[ownFieldName];

    if (connectionFieldName)
        field = field.connectionFields[connectionFieldName];

    return field.type;
};

/**
 *
 * @param {DataSchema} schema
 * @param {string[]} path - Array of field names
 * @param {string} [startType='']
 * @return {string}
 */
export const getTypeNameByPath = (schema, path, startType = '') => path.reduce(
    (acc, cur) => getTypeNameByField(schema, cur, acc),
    startType || schema.queryTypeName
);
