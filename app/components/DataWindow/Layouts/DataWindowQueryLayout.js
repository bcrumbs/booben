'use strict';

import React, { PureComponent, PropTypes } from 'react';


import {
    Checkbox
} from '@reactackle/reactackle';

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
	if (!Array.isArray(object))
		return Object.assign({}, object,
			{
				[path[0]]:
					path.length === 1
					?	value
					:	setObjectValueByPath(object[path[0]], value, path.slice(1))
			}
		);
	else {
		const newObj = [...object];
		const index = path[0] + 1
				? path[0]
				: newObj.push({}) - 1;

		const currentValue = path.length === 1
		?	value
		:	setObjectValueByPath(newObj[index], value, path.slice(1));

		newObj[index] = currentValue;

		return newObj;
	}
};

const getObjectValueByPath = (object, path) =>
	path.length === 1
	?	object[path[0]]
	:	getObjectValueByPath(object[path[0]], path.slice(1));

const removeObjectValueByPath = (object, path) => {
	if (Array.isArray(object))
		if (path.length === 1)
			return object.slice(0, path[0]).concat(object.slice(path[0] + 1));
		else return object.slice(0, path[0]).concat([
			removeObjectValueByPath(object[path[0]], path.slice(1))
		]).concat(object.slice(path[0] + 1));
	else if (path.length === 1) {
		const newObj = Object.assign({}, object);
		delete newObj[path[0]];
		return newObj;
	} else return Object.assign({},
		object, {
			[path[0]]:
				removeObjectValueByPath(object[path[0]], path.slice(1))
		}
	);
};

const parseIntValue = value => {
	const parsedValue = parseInt(value, 10);
	return '' + (
		Number.isSafeInteger(parsedValue) ? parsedValue: 0
	);
};

const parseFloatValue = value => {

	let parsedValue = parseFloat(value);

	const matchedDecimal = value.match(/\.\d*/);

	const fixBy =
		matchedDecimal
		&&	matchedDecimal[0]
		&&	matchedDecimal[0].length - 1;


	return isFinite(parsedValue)
	?
		value.endsWith('.') && value.match(/\./g).length === 1
		?	parsedValue + '.'
		:	!(parsedValue % 1)
			?	parsedValue.toFixed(fixBy + 1 ? fixBy: 0)
			:	parsedValue + ''
	:	'0.0';
};

const getTransformFunction = typeName => (
	{
		Int: parseIntValue,
		Float: parseFloatValue,
	}[typeName]
);

const isPrimitiveGraphQLType = typeName =>
	graphQLPrimitiveTypes.has(typeName);

const getDefaultArgFieldValue = (type, kind) => {
	const defaultValue =
		isPrimitiveGraphQLType(
			type
		)	?	(
				type === 'Boolean'
				?	false
				:	type === 'String'
					?	''
					:	type === 'Int'
						?	0
						:	'0.0'
			)
			:	{};
	if (kind === FIELD_KINDS.LIST) return [defaultValue];
	else return defaultValue;
};


class DataWindowQueryArgumentsFieldForm extends PureComponent {
	constructor(props){
		super(props);
		this.state = this._convertValueAndPropTypeTreeToState(
			props.argField,
			props.argFieldName,
			props.argFieldValue,
			props.types
		);
		this._handleChange = this._handleChange.bind(this);
		this._handleNullSwitch = this._handleNullSwitch.bind(this);
		this._convertObjectToValue = this._convertObjectToValue.bind(this);
		this._createValueAndPropTypeTree = this._createValueAndPropTypeTree.bind(this);
		this._handleAdd = this._handleAdd.bind(this);
		this._handleRemove = this._handleRemove.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState(
			this._convertValueAndPropTypeTreeToState(
				nextProps.argField,
				nextProps.argFieldName,
				nextProps.argFieldValue,
				nextProps.types
			)
		);
	}

	_convertValueAndPropTypeTreeToState(...args) {
		const {
			fieldValue,
			propType
		} = this._createValueAndPropTypeTree(
			...args
		);

		return ({
			fieldValue: {
				[args[1]]: fieldValue,
			},
			propType
		});
	}

	_convertObjectToValue(obj){
		return	{
			value: (
				typeof obj === 'object' && obj !== null
				?	!Array.isArray(obj)
					?	Object.keys(obj).reduce(
							(acc, name) => Object.assign(acc, {
								[name]:
										this._convertObjectToValue(obj[name])
								}
							)

						, {})
				  	:	obj.map(this._convertObjectToValue)
				:	 obj
			),

			message: (
				this.props.argumentsBound
						?	'Arguments already in use'
						: 	void 0
			)
		};
	}

	_createValueAndPropTypeTree(argField, argFieldName, argFieldConstValue, types) {
		let argFieldValue,
			ofType = void 0;

		const isComposite = argField.kind === FIELD_KINDS.LIST;

		if (typeof argFieldConstValue === 'undefined')
			argFieldValue = {};
		else if (argFieldConstValue === null)
			argFieldValue = null;
		else
			argFieldValue = clone(argFieldConstValue);

		if (isComposite && typeof argFieldValue[argFieldName] === 'undefined')
			argFieldValue[argFieldName] = [void 0];

		const subFields =
			!isPrimitiveGraphQLType(argField.type) && !isComposite
			?	Object.keys(types[argField.type].fields).reduce((acc, fieldName) => {
					const field = types[argField.type].fields[fieldName];

					if (argFieldValue !== null) {
						argFieldValue[argFieldName] =
							typeof argFieldValue[argFieldName] === 'undefined'
							?	getDefaultArgFieldValue(argField.type, argField.kind)
							:	argFieldValue[argFieldName];

						const {
							fieldValue,
							propType
						} = this._createValueAndPropTypeTree(
							field,
							fieldName,
							argFieldValue[argFieldName],
							types,
						);

						argFieldValue[argFieldName]
						&&	(argFieldValue[argFieldName][fieldName] = fieldValue);

						return Object.assign(acc, {
							[fieldName]: propType
						});

					}
					else return acc;
				}
				, {})
			:	{};

		if (isComposite) {
			ofType = argFieldValue[argFieldName]
							.map(value => this._createValueAndPropTypeTree(
									Object.assign(
										{},	argField, { kind: FIELD_KINDS.SINGLE }
									), argFieldName, { [argFieldName]: value }, types
					));
			argFieldValue[argFieldName] = ofType.map(
				({ fieldValue }) => fieldValue
			);
		}


		return {
			fieldValue:
			 	argFieldValue
				&&	(
					typeof argFieldValue[argFieldName] === 'undefined'
					?	getDefaultArgFieldValue(argField.type, argField.kind)
					:	argFieldValue[argFieldName]
				),
			propType: {
			   label: argFieldName,
			   view:
			   	   argField.kind === FIELD_KINDS.LIST
				   ?   'array'
				   :
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
			   required: !!argField.nonNull,
			   displayRequired: !!argField.nonNull,
			   notNull: !!argField.nonNull,
			   fields: subFields,
			   ofType: ofType && ofType[0] && ofType[0].propType
			}
		};
	}

	_handleChange(value, path) {
		const newValue = setObjectValueByPath(
			this.state.fieldValue,
			value,
			[this.props.argFieldName].concat(path),
		);
		const {
			fieldValue,
			propType
		} = this._convertValueAndPropTypeTreeToState(
			this.props.argField,
			this.props.argFieldName,
			newValue,
			this.props.types
		);

		this.setState({ fieldValue, propType });

		this.props.setNewArgumentValue(
			fieldValue
		);
	}

	_handleAdd(path, index) {
		this._handleChange(void 0, path.concat([index]));
	}

	_handleRemove(path, index) {
		const newValue = removeObjectValueByPath(
			this.state.fieldValue,
			[this.props.argFieldName].concat(path.concat([index])),
		);

		const {
			fieldValue,
			propType
		} = this._convertValueAndPropTypeTreeToState(
			this.props.argField,
			this.props.argFieldName,
			newValue,
			this.props.types
		);

		this.setState({ fieldValue, propType });

		this.props.setNewArgumentValue(
			fieldValue
		);
	}

	_handleNullSwitch(path) {
		const oldValue =
			getObjectValueByPath(
				this.state.fieldValue,
				[this.props.argFieldName].concat(path)
			);
		const newValue = setObjectValueByPath(
			this.state.fieldValue,
			oldValue === null
			?	void 0
			:	null,
			[this.props.argFieldName].concat(path),
		);

		const {
			fieldValue,
			propType
		} = this._convertValueAndPropTypeTreeToState(
			this.props.argField,
			this.props.argFieldName,
			newValue,
			this.props.types
		);

		this.setState({ fieldValue, propType });

		this.props.setNewArgumentValue(
			fieldValue
		);
	}

	render(){
		const {
			argFieldName,
		} = this.props;

		const {
			fieldValue,
			propType
		} = this.state;

		const currentFieldValue = fieldValue[argFieldName];

		return (
			 <PropsItem
				key={argFieldName}
				propType={propType}
				onChange={
					this._handleChange
				}
				onNullSwitch={
					this._handleNullSwitch
				}
				onAddValue={
					this._handleAdd
				}
				onDeleteValue={
					this._handleRemove
				}
				value={
					this._convertObjectToValue(
								currentFieldValue
							)
				}
			/>
		);
	}

}

DataWindowQueryArgumentsFieldForm.propTypes = {
	argField: PropTypes.object,
	argFieldName: PropTypes.string,
	argFieldValue:	PropTypes.any,
	setNewArgumentValue: PropTypes.func,
	types: PropTypes.object
};

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
		this._getBoundArgumentsByPath = this._getBoundArgumentsByPath.bind(this);
		this._areArgumentsBound = this._areArgumentsBound.bind(this);
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

		const argsForField =
			args
			||	this._getCurrentArguments(
							isCurrentPathLast,
							false,
							name
				).slice(-1)[0]
			||	{};

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
					args: argsForField,
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
							args[num];
						return {
							field: pathStep.name,
							args:
								DataWindowQueryLayout
									.createSourceDataObject(currentArg || {})
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
					:	field.kind === FIELD_KINDS.LIST
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
			?	types[this._getCurrentPathByIndex(-2).type].fields[currentPathLast.name]
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

		const boundArguments = !allArgumentsMode && this._getBoundArgumentsByPath(
			!lastPath
			?	this.state.currentPath.slice(2)
					.concat(
						this.selectedField
						?	[this.selectedField]
						:	[]
					)
			:	this.state.currentPath.slice(2)
		);

		return	allArgumentsMode
			?	this.state.currentPath.slice(2).map(
					({ args }) =>
						args
				)
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
					||	boundArguments
					||	{}
				:	this._getCurrentPathByIndex(-1).args || boundArguments
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
										.connectionFields[name.split('/')[1]]
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

	setNewArgumentValue(argValue, value) {
		Object.assign(argValue, value);
	}

	static extractSourceDataValue(obj) {
		return typeof obj.sourceData.value === 'object' && obj.sourceData.value !== null
		?	Array.isArray(obj.sourceData.value)
			?	obj.sourceData.value.map(
				value => DataWindowQueryLayout.extractSourceDataValue(value)
			)
			:	Object.keys(
				obj.sourceData.value
			).reduce((acc, objName) =>
				Object.assign(
					acc,
					{
						[objName]:	DataWindowQueryLayout.extractSourceDataValue(
							obj.sourceData.value[objName]
						)
					}
				)
			, {})
		:	obj.sourceData.value;
	}

	static createSourceDataObject(obj) {
		return typeof obj === 'object' && obj !== null
				?	Array.isArray(obj)
					?	obj.map(value => ({
						source: 'static',
						sourceData: {
							value:
								DataWindowQueryLayout
									.createSourceDataObject(
										value
							)
						}
					}))
					:	Object.keys(obj).reduce((acc, key) =>
							Object.assign(
								acc,
								{
									[key]: {
										source: 'static',
										sourceData: {
											value:
												DataWindowQueryLayout
													.createSourceDataObject(
														obj[key]
											)
										}
									}
								}
							)
					  , {})
			 :	obj;
	}

	createContentArgumentsType(
		fields,
		fieldsArgsValues,
		areArgumentsBound,
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
													argumentsBound={
														areArgumentsBound[fieldNumber]
													}
													setNewArgumentValue={value =>
														setNewArgumentValue(
															argsValues[fieldNumber],
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

					if (
						field.kind === FIELD_KINDS.SINGLE
						&&	!equalMetaToGraphQLTypeNames(propType, field.type)
					)	return acc;

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
							Object.keys(connectionFields).filter(
								connectionFieldName => {
									const connectionField
										= field.connectionFields[connectionFieldName];
									if (connectionField.kind === FIELD_KINDS.SINGLE
										&&	!equalMetaToGraphQLTypeNames(
												propType,
												connectionField.type
											)
									)	return false;
									return true;
								}
							).map(connectionFieldName =>
								createContentField(
									connectionFields[connectionFieldName],
									fieldName + '/' + connectionFieldName,
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

	_getBoundArgumentsByPath(path) {
		let args = void 0;
		this.props.queryArgsList
		&&	this.props.queryArgsList.forEach(
			currentQueryNode => {
				for (let k = 0; k < path.length; k++) {
					const pathStep = currentQueryNode.get(k);
					if (pathStep.field !== path[k].name) return true;
				}
				args = currentQueryNode.get(path.length - 1).toJS().args;
				return false;
			}
		);

		args && Object.keys(args).forEach(
			argName => args[argName] = DataWindowQueryLayout.extractSourceDataValue(
				args[argName]
			)
		);
		return args;
	}

	_areArgumentsBound(fields) {
		const currentPath = this.state.currentPath.concat(
			!this.state.argumentsForCurrentPathLast
			&&	!this.state.allArgumentsMode
			?	[this.selectedField]
			:	[]
		);
		let currentPathIndex = 1;
		return fields.map(field => {
			while(
				++currentPathIndex < currentPath.length
				&&
				!this._equalFieldPaths(
					currentPath[currentPathIndex], field
				)
			);
			return !!(this._equalFieldPaths(
				currentPath[currentPathIndex], field
			) && this._getBoundArgumentsByPath(
				currentPath.slice(
					2, currentPathIndex + 1
				)
			));
		});
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
						this._areArgumentsBound(
							currentEditingFields
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
