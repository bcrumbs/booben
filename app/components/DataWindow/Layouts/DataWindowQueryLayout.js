'use strict';

import React, { Component, PropTypes } from 'react';

import {
	DataWindowDataLayout
}	from './DataWindowDataLayout';

import {
    DataWindowContent,
    DataWindowContentGroup
} from '../DataWindowContent/DataWindowContent';

import {
    PropsList,
    PropsItem
} from '../../PropsList/PropsList';


import {
	graphQLPrimitiveTypes,
	equalMetaToGraphQLTypeNames,
	FIELD_KINDS
} from '../../../utils/schema';

import {
	clone,
	objectFilter
} from '../../../utils/misc';

import {
    getComponentMeta,
    getPropTypedef,
    getNestedTypedef
} from '../../../utils/meta';


const setObjectValueByPath = (object, value, path) => {
	return Object.assign({}, object,
		{
			[path[0]]:
				path.length === 1
				?	value
				:	setObjectValueByPath(object[path[0]], value, path.slice(1))
		}
	);
}



const getTransformFunction = (typeName) => (
	{
		Int: parseInt,
		Float: parseFloat,
	}[typeName]
);

const isPrimitiveGraphQLType = (typeName) =>
	graphQLPrimitiveTypes.has(typeName);

class DataWindowQueryArgumentsFieldForm extends Component {
	constructor(props){
		super(props);
		this.state = {
			fieldValue: props.argFieldValue
		};
		this._convertObjectToValue = this._convertObjectToValue.bind(this);
		this._createValueAndPropTypeTree = this._createValueAndPropTypeTree.bind(this);
	}

	_convertObjectToValue(obj){
		return Object.keys(obj).reduce(
			(acc, name) => Object.assign(acc, {
				[name]:
					{
						value: (
							typeof obj[name] === 'object'
							?	this._convertObjectToValue(obj[name])
							:	obj[name]
						)
					}
				}
			)

		, {});
	}


	_createValueAndPropTypeTree(argField, argFieldName, argFieldValue = {}, types) {

		const subFields =
			!isPrimitiveGraphQLType(argField.type)
			?	Object.keys(types[argField.type].fields).reduce((acc, fieldName) => {
					const field = types[argField.type].fields[fieldName];

					argFieldValue[argFieldName] =
						argFieldValue[argFieldName]
							||	(
								!isPrimitiveGraphQLType(argField.type)
							 	?	{}
								:	''
							);

					const {
						fieldValue,
						propType
					} = this._createValueAndPropTypeTree(
						field,
						fieldName,
						argFieldValue[argFieldName],
						types,
					);

					argFieldValue[argFieldName][fieldName] = fieldValue;

					return Object.assign(acc, {
						[fieldName]: propType
					});
				}
				, {})
			:	{};

		return {
			fieldValue: argFieldValue[argFieldName] || '',
			propType: {
			   label: argFieldName,
			   view:
				   isPrimitiveGraphQLType(argField.type)
				   ?
					   argField.type === 'Boolean'
					   ?	'select'
					   :	'input'
				   :	'shape',
			   type: argField.type,
			   transformValue: getTransformFunction(
					 argField.type
			   ),
			   required: argField.nonNull,
			   displayRequired: argField.nonNull,
			   notNull: argField.nonNull,
			   fields: subFields
			}
		};
	}

	render(){

		const {
			argField,
			argFieldName,
			types,
			setNewArgumentValue
		} = this.props;
			const { fieldValue, propType } = this._createValueAndPropTypeTree(
				argField,
				argFieldName,
				clone(this.state.fieldValue),
				types
			);

			return (
				 <PropsItem
					key={argFieldName}
					propType={propType}
					onChange={
						(value, path) => {
							const newFieldValue = setObjectValueByPath(
								this.state.fieldValue,
								value,
								[argFieldName].concat(path),
							);

							this.setState({ fieldValue: newFieldValue });

							setNewArgumentValue(
								newFieldValue
							);
						}
					}
					value={
						{
							value: isPrimitiveGraphQLType(
								argField.type
							)
							?	fieldValue
							:	this._convertObjectToValue(
									fieldValue
								)
						}
					}
				/>
			);
	}

}

export class DataWindowQueryLayout extends DataWindowDataLayout {
	constructor(props){
		super(props);
		const { queryTypeName } = this.props.schema;
		this.state = {
			currentPath: [
				{ name: 'Data' },
				{ name: 'Query', type: queryTypeName }
			],
			previousPath: [
			],
			argumentsForCurrentPathLast: false,
			argumentsPath: [],
			argumentsMode: false,
			allArgumentsMode: false,
			selectedFieldName: '',
		};
		this._handleJumpIntoField = this._handleJumpIntoField.bind(this);
		this._handleJumpToCurrentPathIndex =
			this._handleJumpToCurrentPathIndex.bind(this);
		this._handleFieldSelect = this._handleFieldSelect.bind(this);
		this._handleSetArgumentsPress = this._handleSetArgumentsPress.bind(this);
		this._handleDataApplyPress = this._handleDataApplyPress.bind(this);
		this._handleArgumentsApplyPress = this._handleArgumentsApplyPress.bind(this);
		this._handleBackToPress = this._handleBackToPress.bind(this);
		this._getCurrentEditingFields = this._getCurrentEditingFields.bind(this);
	}

	_equalFieldPaths(path1, path2) {
		if (!path1 || !path2) return false;
		return ['name', 'type', 'kind'].every(
			name => path1[name] === path2[name]
		);
	}

	_handleJumpIntoField(name, type, kind, args, isCurrentPathLast) {
		const { previousPath, currentPath } = this.state;
		const isPrimitiveType = isPrimitiveGraphQLType(type);

		this.setState({
			argumentsPath: [],
			argumentsMode: isPrimitiveType,
			allArgumentsMode: isPrimitiveType,
			argumentsForCurrentPathLast: false,
			currentPath: [
				...(
					isCurrentPathLast
					?	currentPath.slice(0, -1)
					:	currentPath
				),
				{
					name,
					type,
					kind,
					args:
						args
						||	this._getCurrentArguments(
								isCurrentPathLast,
								false,
								name
							).slice(-1)[0]
						||	{}
				}
			],
			previousPath:
				this._equalFieldPaths(
					previousPath[currentPath.length],
					{ name, type, kind }
				) || isCurrentPathLast
				?	previousPath
				:	[]
		});
	}

	_handleJumpToCurrentPathIndex(index) {
		const lengthDiff =
			this.state.currentPath.length
			-
			this.state.previousPath.length;

		if (!index) return this.props.backToMainLayout();

		if (index + 1 !== this.state.currentPath.length)
			this.setState({
				currentPath: this.state.currentPath.slice(
					0,
					index + 1
				),
				previousPath:
					this.state.currentPath.slice(0).concat(
						lengthDiff < 0
						?	this.state.previousPath.slice(lengthDiff)
						:	[]
					),
				selectedFieldName: '',
				argumentsMode: false,
				allArgumentsMode: false
			});
	}

	_handleFieldSelect(selectedFieldName) {
		if (selectedFieldName !== this.state.selectedFieldName)
			this.setState({ selectedFieldName });
	}

	_handleSetArgumentsPress(argumentsForCurrentPathLast) {
		this.setState({
			argumentsMode: true,
			argumentsForCurrentPathLast,
		});
	}

	_handleArgumentsApplyPress(args) {
		if (!this.state.allArgumentsMode) {
			const { name, kind, type } = this._getCurrentEditingFields()[0];
			this._handleJumpIntoField(
				name,
				type,
				kind,
				args[0],
				this.state.argumentsForCurrentPathLast
			);
		} else
			this._applyPropData(args);
	}

	_applyPropData(args = []) {
		const currentArguments = this._getCurrentArguments(false, true);
		this.props.onUpdateComponentPropValue(
			this.props.linkingPropOfComponentId,
			this.props.linkingPropName,
			this.props.linkingPropPath,
			'data',
			{
				queryPath: (
					this._getCurrentEditingFields(true).concat(
						this.state.allArgumentsMode
						&&	isPrimitiveGraphQLType(
							this._getCurrentPathByIndex(-1).type
						)
						?	[]
						:	[ this.selectedField ]
					)
				).map((pathStep, num) => {
						const currentArg =
							args[num]
							|| currentArguments[num];
						return {
							field: pathStep.name,
							args:
								Object.keys(currentArg || {}).reduce(
									(acc, argName) => Object.assign(acc,
										{
											[argName]: {
												source: 'static',
												sourceData: {
													value: (currentArg)[
														argName
													]
												}


											}
										}
									)
								, {})
						};
					}
				)
			}
		);
		this.props.onLinkPropCancel();
	}

	_handleDataApplyPress() {
		if (!this._getCurrentEditingFields(true).concat([this.selectedField]).some(
			({ args }) => Object.keys(args).length
		))
		 	this._applyPropData();
		else
			this._handleJumpIntoField(
				this.selectedField.name,
				this.selectedField.type,
				this.selectedField.kind,
				{}
			);

	}

	_handleBackToPress() {
		const argumentsMode = !!this.state.argumentsPath.length;
		if (this.state.argumentsMode)
			if (this.state.allArgumentsMode)
				this._handleJumpToCurrentPathIndex(
					this.state.currentPath.length - 2
				);
			else
				this.setState({
					argumentsPath: this.state.argumentsPath.slice(0, -1),
					argumentsMode,
					allArgumentsMode:
						this.state.argumentsForCurrentPathLast
						&&	argumentsMode,
					argumentsForCurrentPathLast:
						this.state.argumentsForCurrentPathLast
						&&	argumentsMode
				});

		else
			this._handleJumpToCurrentPathIndex(this.state.currentPath.length - 2);
	}


	_getCurrentPathByIndex(index) {
		return this.state.currentPath.slice(index)[0];
	}

	_getFieldTypeName(field) {
		return field.type
				+ (
					field.kind === FIELD_KINDS.CONNECTION
					?	' connection'
					:	field.kind === 'LIST'
						?	' list'
						:	''
				);
	}

	get breadcrumbs() {
		return this.state.currentPath.map(
			({ name }) => ({
				title: name
			})
		);
	}

	get selectedField() {
		const { types } = this.props.schema;
		const currentPathLast = this._getCurrentPathByIndex(-1);
		return isPrimitiveGraphQLType(currentPathLast.type)
			?	types[this._getCurrentPathByIndex(-2)].fields[currentPathLast.name]
			:	types[currentPathLast.type].fields[this.state.selectedFieldName];
	}

	_getCurrentArguments(
		lastPath,
		allArgumentsMode,
		fieldName = this.state.selectedFieldName
	) {
		const previousPathField =
			this.state.previousPath[this.state.currentPath.length];

		if (this.state.currentPath.length === 1) return [{}];

		return	allArgumentsMode
			?	this.state.currentPath.slice(2).map(({ args }) => args)
			:	[
				!lastPath
				?
					previousPathField
					&&	this._equalFieldPaths(
						previousPathField,
						this.props.schema.types[this._getCurrentPathByIndex(-1).type]
							.fields[fieldName]
					)
					&&	previousPathField.args
					||	{}
				:	this._getCurrentPathByIndex(-1).args
			];

	}

	_getCurrentEditingFields(allCurrentPathFields) {
		const { types, queryTypeName } = this.props.schema;
		return this.state.currentPath.length > 2
			?	this.state.allArgumentsMode || allCurrentPathFields
				?	this.state.currentPath.slice(2).reduce((path, { name }) =>
					{
						const parentField = types[
							path.length
							?	path[path.length - 1].type
							:	queryTypeName
						];

						const fieldConnections = objectFilter(parentField.fields,
							({ kind }) => kind === FIELD_KINDS.CONNECTION
						);

						return path.concat(
							parentField.fields[name]
							||	Object.keys(fieldConnections).reduce(
								(_, fieldConnectionName)	=>
									_ || fieldConnections[fieldConnectionName]
										.connectionFields[name.split(' ')[1]]
							, void 0)
						);

					}
					, [])
				:
					[
						this.state.argumentsMode
						&&	!this.state.argumentsForCurrentPathLast
						?	types[this._getCurrentPathByIndex(-1).type]
									.fields[this.state.selectedFieldName]
						:	types[this._getCurrentPathByIndex(-2).type]
									.fields[this._getCurrentPathByIndex(-1).name]
					]
			:	[
				this.state.currentPath.length === 2
				&& !this.state.argumentsForCurrentPathLast && this.state.argumentsMode
				?	types[queryTypeName].fields[this.state.selectedFieldName]
				:	null
			];
	}

	haveArguments(field) {
		return !!(field && field.args && Object.keys(field.args).length);
	}

	setNewArgumentValue(argValue, fieldName, value) {
		Object.assign(argValue, value);
	}


	createContentArgumentsType(
		fields,
		fieldsArgsValues,
		backToFieldName,
		types,
		haveArguments,
		createContentArgumentField,
		setNewArgumentValue,
		handleJumpIntoField,
		handleBackToPress,
		handleApplyPress,
		title = fields.length - 1
				?	`All arguments`
				:	`${fields[0].name} arguments`,
		subtitle = 'Please, fill required arguments',
		description = '',
	) {
		let argsValues = clone(fieldsArgsValues).map(
			value => value || {}
		);
		return (
			{
			    content: {
			        title,
			        subtitle,
			        description,
			        children: [
						fields.map((field, fieldNumber) =>
							haveArguments(field)
							?
								<DataWindowContentGroup
									title={field.name}
								>
					                <PropsList key={fieldNumber}>
									{
										 Object.keys(field.args).map(
											 argName =>
											 	<DataWindowQueryArgumentsFieldForm
													argField={field.args[argName]}
													argFieldName={argName}
													argFieldValue={
														argsValues[fieldNumber]
													}
													setNewArgumentValue={value =>
														setNewArgumentValue(
															argsValues[fieldNumber],
															argName,
															value
														)
													}
													types={types}
													key={argName}
												/>
										 )
									}
					                </PropsList>
								</DataWindowContentGroup>
							: 	null
						)
			        ],
			    },
			    buttons: [
					{
			            text: `Back to ${backToFieldName}`,
			            icon: 'chevron-left',
						onPress: handleBackToPress
			        },
			        {
						text: 'Apply',
						onPress: () => handleApplyPress(argsValues)
					}
			    ]
			}
		);
	}

	createContentField(
		field,
		fieldName,
		selectedFieldName,
		getFieldTypeName,
		handleFieldSelect,
		handleSetArgumentsClick,
		handleApplyClick,
		handleJumpIntoField,
		propType
	) {
		return (
			{
				title: fieldName,
				type: getFieldTypeName(field),
				tooltip: field.description,
				actionType: 'select',
				clickable: true,
				argsButton: !!Object.keys(field.args).length,
				chosen: fieldName === selectedFieldName,
				connection: !isPrimitiveGraphQLType(field.type),
				canBeApplied: equalMetaToGraphQLTypeNames(propType, field.type),
				state: 'error',
				onSelect: () => handleFieldSelect(fieldName),
				onApplyClick: () => handleApplyClick(fieldName),
				onSetArgumentsClick: () => handleSetArgumentsClick(false),
				onJumpIntoClick: () => handleJumpIntoField(
					fieldName,
					field.type,
					field.kind,
					void 0,
					false
				)
			}
		);
	}

	createContentType(
		type,
		currentPathLast,
		selectedFieldName,
		hasArgs,
		breadcrumbs,
		getFieldTypeName,
		handleFieldSelect,
		handleSetArgumentsClick,
		handleApplyClick,
		handleJumpIntoField,
		createContentField,
		propType
	) {
		return {
			breadcrumbs,
			content: {
				title: currentPathLast.name,
				subtitle: `type: ${
					getFieldTypeName(currentPathLast)
				}`,
				description: type.description,
				argsButton: hasArgs,
		        contentHeading: 'Fields',
				list: Object.keys(type.fields).reduce((acc, fieldName) => {
					const field = type.fields[fieldName];
					const connectionFields =
						field.kind === FIELD_KINDS.CONNECTION
						?	field.connectionFields
						:	{};
					return acc.concat(
						[createContentField(
							field,
							fieldName,
							selectedFieldName,
							getFieldTypeName,

							handleFieldSelect,
							handleSetArgumentsClick,
							handleApplyClick,
							handleJumpIntoField,
							propType
						)]).concat(
							Object.keys(connectionFields).map(connectionFieldName =>
								createContentField(
									connectionFields[connectionFieldName],
									fieldName + ' ' + connectionFieldName,
									selectedFieldName,
									getFieldTypeName,

									handleFieldSelect,
									handleSetArgumentsClick,
									handleApplyClick,
									handleJumpIntoField,
									propType
								)
							)
						);
				}, []),
				onSetArgumentsClick:
					() => handleSetArgumentsClick(true),
			},
			children: [],
		};
	}

	get CONTENT_TYPE() {
		const currentEditingFields = this._getCurrentEditingFields();

		const linkTargetComponent =
			this.props.components.get(this.props.linkingPropOfComponentId);

		const linkTargetComponentMeta = getComponentMeta(
			linkTargetComponent.name,
			this.props.meta
		);

		const linkTargetPropTypedef = getNestedTypedef(
			getPropTypedef(
				linkTargetComponentMeta,
				this.props.linkingPropName
			),

			this.props.linkingPropPath
		);

		return (
			!this.state.argumentsMode
			?	this.createContentType(
						this.props.schema.types[this._getCurrentPathByIndex(-1).type],
						this._getCurrentPathByIndex(-1),
						this.state.selectedFieldName,
						this.haveArguments(currentEditingFields[0]),
						this.breadcrumbs,
						this._getFieldTypeName,

						this._handleFieldSelect,
						this._handleSetArgumentsPress,
						this._handleDataApplyPress,
						this._handleJumpIntoField,
						this.createContentField,
						linkTargetPropTypedef.type
					)
			:	this.createContentArgumentsType(
						currentEditingFields,
						this._getCurrentArguments(
							this.state.argumentsForCurrentPathLast,
							this.state.allArgumentsMode
						),
						this._getCurrentPathByIndex(
							isPrimitiveGraphQLType(
								this._getCurrentPathByIndex(-1).type
							)
						?	-2
						:	-1
						).name,
						this.props.schema.types,
						this.haveArguments,
						this.createContentArgumentField,
						this.setNewArgumentValue,
						this._handleJumpIntoField,
						this._handleBackToPress,
						this._handleArgumentsApplyPress
					)
		);
	}
}

DataWindowQueryLayout.displayName = 'DataWindowQueryLayout';
