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
	DataWindowQueryArgumentsFieldForm
} from './DataWindowQueryArgumentsFieldForm/DataWindowQueryArgumentsFieldForm';

import {
    PropsList,
    PropsItem
} from '../../PropsList/PropsList';

import {
	isPrimitiveGraphQLType,
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

const canBeApplied = (metaType, graphQLType) => {
  //TODO make equality check deeper? or not? or ...?
  const isGraphQLTypeList =
    graphQLType.kind === FIELD_KINDS.CONNECTION
    ||	graphQLType.kind === FIELD_KINDS.LIST;

	if (metaType.type === 'arrayOf') {
		if (metaType.ofType.type === 'object')
			return isGraphQLTypeList && !isPrimitiveGraphQLType(graphQLType.type);
    	else if (
	        isGraphQLTypeList
	  			&&
	  			equalMetaToGraphQLTypeNames(metaType.ofType.type, graphQLType.type)
	  		)	return true;
	}  else	if (
    		graphQLType.kind === FIELD_KINDS.SINGLE
    		&& (
	          metaType.type === 'oneOf'
	          && metaType.ofType.options.some(
				  option => equalMetaToGraphQLTypeNames(option.type, graphQLType.type)
			  )
	    		  || equalMetaToGraphQLTypeNames(metaType.type, graphQLType.type)
	        )
     	) return true;
	return false;
};

const showField = (metaType, graphQLType) =>
	canBeApplied(metaType, graphQLType)
		||	(
			!isPrimitiveGraphQLType(graphQLType.type)
			&&	graphQLType.kind === FIELD_KINDS.SINGLE
		);

const canGoIntoField = (metaType, graphQLType) =>
	graphQLType.kind === FIELD_KINDS.SINGLE
		&& !isPrimitiveGraphQLType(graphQLType.type);

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
		this._getSelectedField = this._getSelectedField.bind(this);
		this._areArgumentsBound = this._areArgumentsBound.bind(this);
	}

	_equalFieldPaths(path1, path2) {
		if (!path1 || !path2) return false;
		return ['name', 'type', 'kind'].every(
			name => path1[name] === path2[name]
		);
	}

	_handleJumpIntoField(name, type, kind, args, isCurrentPathLast = false) {
		const { previousPath, currentPath } = this.state;
		const isDataApplied = canBeApplied(this.currentPropType, { type, kind });

		const argsForField =
			args
			||	this._getCurrentArguments(
					isCurrentPathLast,
					false,
					name
				).slice(-1)[0]
			||	{};

		this.setState({
			argumentsMode: isDataApplied,
			allArgumentsMode: isDataApplied,
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
		const queryPath = this._getCurrentEditingFields(true).concat(
				!this.state.allArgumentsMode
				&&	this._getSelectedField()
				?	[ this._getSelectedField() ]
				:	[]
			).map(pathStep => ({
				field: pathStep.name,
			})
		);

		const queryArgs = args.reduce((acc, currentArg, num) =>
			Object.keys(currentArg).length
			?	Object.assign(acc, {
				['']: Object.assign(
					{}, acc[''], {
						[queryPath.slice(0, num + 1)
							.map(({ field }) => field).join(' ')]:
								DataWindowQueryLayout
									.createSourceDataObject(currentArg)
					}
				)
			}, {})
			:	acc
		, {});
		this.props.onUpdateComponentPropValue(
			this.props.linkingPropOfComponentId,
			this.props.linkingPropName,
			this.props.linkingPropPath,
			'data',
			{
				queryPath
			},
			queryArgs

		);
		this.props.onLinkPropCancel();
	}

	_handleDataApplyPress() {
		if (!this._getCurrentEditingFields(true).concat(
			this._getSelectedField()
			?	[ this._getSelectedField() ]
			:	[]
		).some(
			({ args }) => Object.keys(args).length
		))
		 	this._applyPropData();
		else
			this._handleJumpIntoField(
				this._getSelectedField().name,
				this._getSelectedField().type,
				this._getSelectedField().kind,
				void 0
			);

	}

	_handleBackToPress() {
		const argumentsMode = false;
		if (this.state.argumentsMode)
			if (this.state.allArgumentsMode)
				this._handleJumpToCurrentPathIndex(
					this.state.currentPath.length - 2
				);
			else
				this.setState({
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

	get currentSelectionPath() {
		return this.state.currentPath.slice(2);
	}

	get breadcrumbs() {
		return this.state.currentPath.map(
			({ name }) => ({
				title: name
			})
		);
	}

	_getSelectedField(fieldName = this.state.selectedFieldName) {
		const { types } = this.props.schema;
		const currentPathLast = this._getCurrentPathByIndex(-1);
		if (!isPrimitiveGraphQLType(currentPathLast.type)) {
			const isSelectedFieldConnectionField
				= fieldName.includes('/');
			if (isSelectedFieldConnectionField) {
				const compositeFieldName = fieldName.split('/');
				return Object.assign({}, types[currentPathLast.type].fields[
					compositeFieldName[0]
				].connectionFields[compositeFieldName[1]], { name: fieldName});
			}
			return types[currentPathLast.type].fields[fieldName];
		}
		else return types[this._getCurrentPathByIndex(-2).type]
							.fields[currentPathLast.name];
	}

	_getCurrentArguments(
		lastPath,
		allArgumentsMode,
		fieldName = this.state.selectedFieldName
	) {
		const previousPathField =
			this.state.previousPath[this.state.currentPath.length];

		const boundArguments = !allArgumentsMode && this._getBoundArgumentsByPath(
			!lastPath
			?	this.currentSelectionPath
					.concat(
						this._getSelectedField(fieldName)
						?	[this._getSelectedField(fieldName)]
						:	[]
					)
			:	this.currentSelectionPath
		);

		return	allArgumentsMode
			?	this.currentSelectionPath.map(
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
		const { types } = this.props.schema;
		return this.currentSelectionPath.length
			?	this.state.allArgumentsMode || allCurrentPathFields
				?	this.currentSelectionPath.reduce((path, { name }) =>
					{

						const parentField = types[
							path.length
							?	path[path.length - 1].type
							:	this._getCurrentPathByIndex(
								-1 - this.currentSelectionPath.length
							).type
						];

						const fieldConnections = objectFilter(parentField.fields,
							({ kind }) => kind === FIELD_KINDS.CONNECTION
						);

						return path.concat(
							parentField.fields[name]
							||	Object.assign({}, Object.keys(fieldConnections).reduce(
								(_, fieldConnectionName)	=>
									_ || fieldConnections[fieldConnectionName]
											.connectionFields[name.split('/')[1]]
							, void 0), { name })
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
			:	!this.currentSelectionPath.length
				&& !this.state.argumentsForCurrentPathLast && this.state.argumentsMode
				?	[types[
						this._getCurrentPathByIndex(-1).type
					].fields[this.state.selectedFieldName]]
				:	[]
			;
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
				DataWindowQueryLayout.extractSourceDataValue
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
						})
					)
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

	/**
	 * @param {Array<Object>} fields
	 * @param {Array<Object>} fieldsArgsValues
	 * @param {Array<boolean>} areArgumentsBound
	 * @param {bool} allArgumentsMode
	 * @param {string} backToFieldName
	 * @param {Object<Object>} types
	 * @param {Function} haveArguments
	 * @param {Function} createContentArgumentField
	 * @param {Function} setNewArgumentValue
	 * @param {Function} handleJumpIntoField
	 * @param {Function} handleBackToPress
	 * @param {Function} handleApplyPress
	 * @param {string=} title
	 * @param {string=} subtitle
	 * @param {string=} description
	 * @return {Object}
	 *
	 */
	createContentArgumentsType(
		fields,
		fieldsArgsValues,
		areArgumentsBound,
		allArgumentsMode,
		backToFieldName,
		types,
		haveArguments,
		createContentArgumentField,
		setNewArgumentValue,
		handleJumpIntoField,
		handleBackToPress,
		handleApplyPress,
		handleJumpToCurrentPathIndex,
		title = allArgumentsMode
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

	/**
	 * @param {Object} field
	 * @param {string} fieldName
	 * @param {string} selectedFieldName
	 * @param {string} propType
	 * @param {Function<>:string} getFieldTypeName
	 * @param {Function} handleFieldSelect
	 * @param {Function} handleSetArgumentsClick
	 * @param {Function} handleApplyClick
	 * @param {Function} handleJumpIntoField
	 * @return {Object}
	 *
	 */
	createContentField(
		field,
		fieldName,
		selectedFieldName,
		propType,
		getFieldTypeName,
		handleFieldSelect,
		handleSetArgumentsClick,
		handleApplyClick,
		handleJumpIntoField
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
				connection: canGoIntoField(propType, field),
				canBeApplied: canBeApplied(propType, field),
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

	/**
	 * @param {Object} type - Schema type
	 * @param {Object} currentPathLast
	 * @param {string} selectedFieldName
	 * @param {string} propType
	 * @param {boolean} hasArgs
	 * @param {Array<Object>} breadcrumbs
	 * @param {Function<Object>:string} getFieldTypeName
	 * @param {Function} handleFieldSelect
	 * @param {Function} handleSetArgumentsClick
	 * @param {Function} handleApplyClick
	 * @param {Function} handleJumpIntoField
	 * @param {Function} createContentField
	 * @param {Function} handleJumpToCurrentPathIndex
	 * @return {Object}
	 *
	 */
	createContentType(
		type,
		currentPathLast,
		selectedFieldName,
		propType,
		hasArgs,
		breadcrumbs,
		getFieldTypeName,
		handleFieldSelect,
		handleSetArgumentsClick,
		handleApplyClick,
		handleJumpIntoField,
		createContentField,
		handleJumpToCurrentPathIndex
	) {
		return {
			breadcrumbs,
			handleBreadcrumbsClick: handleJumpToCurrentPathIndex,
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
						!showField(propType, field)
					)	return acc;

					return acc.concat(
						[createContentField(
							field,
							fieldName,
							selectedFieldName,
							propType,
							getFieldTypeName,
							handleFieldSelect,
							handleSetArgumentsClick,
							handleApplyClick,
							handleJumpIntoField
						)]).concat(
							Object.keys(connectionFields).filter(
								connectionFieldName => {
									const connectionField
										= field.connectionFields[connectionFieldName];
									return showField(
										propType,
										connectionField
									);
								}
							).map(connectionFieldName =>
								createContentField(
									connectionFields[connectionFieldName],
									fieldName + '/' + connectionFieldName,
									selectedFieldName,
									propType,
									getFieldTypeName,
									handleFieldSelect,
									handleSetArgumentsClick,
									handleApplyClick,
									handleJumpIntoField
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

	/**
	 * @param {Array<Object>} path
	 * @return {undefined|Object} - arguments for path's last node
	 */
	_getBoundArgumentsByPath(path) {
		const queryArgsMap = this.props.currentComponentWithQueryArgs.queryArgs;
		const args = queryArgsMap.get('')
				&&
				queryArgsMap
					.get('').get(path.map(({ name }) => name).join(' '));

		const formattedArgs = args ? args.toJS() : {};

		return args && Object.keys(formattedArgs).reduce((acc, key) =>
			Object.assign(
				acc, {
					[key]:
						DataWindowQueryLayout.extractSourceDataValue(formattedArgs[key])
				}
			)
		,{});
	}

	/**
	 * @param {Array<Object>} fields - graphQLSchema fields
	 * @return {Array<boolean>} - every element represents
	 * arguments state for this field (bound or not)
	 */
	_areArgumentsBound(fields) {
		const currentPath = this.currentSelectionPath.concat(
			!this.state.argumentsForCurrentPathLast
			&&	!this.state.allArgumentsMode
			?	[this._getSelectedField()]
			:	[]
		);
		let currentPathIndex = -1;
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
					0, currentPathIndex + 1
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

		this.currentPropType = linkTargetPropTypedef;

		return (
			!this.state.argumentsMode
			?	this.createContentType(
						this.props.schema.types[this._getCurrentPathByIndex(-1).type],
						this._getCurrentPathByIndex(-1),
						this.state.selectedFieldName,
						linkTargetPropTypedef,
						this.haveArguments(currentEditingFields[0]),
						this.breadcrumbs,
						this._getFieldTypeName,
						this._handleFieldSelect,
						this._handleSetArgumentsPress,
						this._handleDataApplyPress,
						this._handleJumpIntoField,
						this.createContentField,
						this._handleJumpToCurrentPathIndex
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
						this.state.allArgumentsMode,
						this.props.schema.types,
						this.haveArguments,
						this.createContentArgumentField,
						this.setNewArgumentValue,
						this._handleJumpIntoField,
						this._handleBackToPress,
						this._handleArgumentsApplyPress,
						this._handleJumpToCurrentPathIndex,

					)
		);
	}
}

DataWindowQueryLayout.displayName = 'DataWindowQueryLayout';
