'use strict';

import React, { PureComponent, PropTypes } from 'react';

import {
	Button,
	Breadcrumbs,
    Checkbox,
	Dialog
} from '@reactackle/reactackle';

import {
	BlockContent,
	BlockContentBox,
	BlockContentNavigation,
	BlockContentTitle,
	BlockBreadcrumbs
} from '../BlockContent/BlockContent';

import {
    PropsList,
    PropsItem
} from "../PropsList/PropsList";

import {
    DataWindowContent,
    DataWindowContentGroup
} from './DataWindowContent/DataWindowContent';

import {
	graphQLPrimitiveTypes,
	equalMetaToGraphQLTypeNames,
	FIELD_KINDS
} from '../../utils/schema';

import {
	clone,
	objectFilter
} from '../../utils/misc';

import {
	linkPropCancel,
	updateComponentPropValue
}	from '../../actions/project';

import {
	connect
} from 'react-redux';

import {
    currentComponentsSelector
} from '../../selectors';

import {
    getComponentMeta,
    getPropTypedef,
    getNestedTypedef
} from '../../utils/meta';

import './DataWindow.scss';

class DataWindowComponent extends PureComponent {
	constructor(props){
		super(props);
		this.state = {
			currentPath: [
				{ name: 'Data' }
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
		const isPrimitiveType = this._isPrimitiveGraphQLType(type);

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
						&&	this._isPrimitiveGraphQLType(
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
													value:
														(currentArg)[
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

	_isPrimitiveGraphQLType(type) {
		return graphQLPrimitiveTypes.has(type);
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
		return this._isPrimitiveGraphQLType(currentPathLast.type)
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
				&&
					previousPathField
					&&	this._equalFieldPaths(
						previousPathField,
						this.props.schema.types[this._getCurrentPathByIndex(-1).type]
							.fields[fieldName]
					)
					&&	previousPathField.args
				||	this._getCurrentPathByIndex(-1).args
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

	get DataLayout() {
		return ({
		    content: {
		        list: [
		            {
		                title: 'Query',
		                actionType: 'jump',
		                connection: true,
						onSelect: () => this._handleJumpIntoField(
							'Query',
							this.props.schema.queryTypeName,
							'SINGLE'
						)
		            },
		            {
		                title: 'Functions',
		                actionType: 'jump',
		                connection: true
		            },
		            {
		                title: 'Context',
		                actionType: 'jump',
		                connection: true
		            },
		            {
		                title: 'State',
		                actionType: 'jump',
		                connection: true
		            }

		        ]
		    }
		});
	}

	haveArguments(field) {
		return !!(field && field.args && Object.keys(field.args).length);
	}

	createContentArgumentField(
		argField,
		argFieldName,
		parentArgValueReference,
		isPrimitiveGraphQLType
	) {
		/*parentArgValueReference[argFieldName] =
			parentArgValueReference[argFieldName] || argField.defaultValue;*/

		return (
			 <PropsItem
				key={argFieldName}
				propType={{
					label: argFieldName,
					view:
						isPrimitiveGraphQLType(argField.type)
						?
							argField.type === 'Boolean'
							?	'select'
							:	'input'
						:	'shape',
					type: argField.type,
					fields:
						!isPrimitiveGraphQLType(argField.type)
						?	this.props.schema.types[argField.type].fields
						:	[]
					,
					required: !argField.nonNull,
					notNull: argField.nonNull
				}}
				onChange={
					value =>
					parentArgValueReference[argFieldName] = value
				}
				value={
					{ value: parentArgValueReference[argFieldName] }
				}
			/>
		);
	}

	createContentArgumentsType(
		fieldsBlocks,
		fieldsArgsValues,
		backToFieldName,
		haveArguments,
		createContentArgumentField,
		isPrimitiveGraphQLType,
		handleJumpIntoField,
		handleBackToPress,
		handleApplyPress,
		title = fieldsBlocks.length - 1
				?	`All arguments`
				:	`${fieldsBlocks[0].name} arguments`,
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
						fieldsBlocks.map((field, blockNumber) =>
							haveArguments(field)
							?
								<DataWindowContentGroup
									title={field.name}
								>
					                <PropsList key={blockNumber}>
									{
										 Object.keys(field.args).map(
											 argName =>
											 	createContentArgumentField(
													field.args[argName],
													argName,
													argsValues[blockNumber],
													isPrimitiveGraphQLType
												)
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
		isPrimitiveGraphQLType,
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
		isPrimitiveGraphQLType,
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
							isPrimitiveGraphQLType,
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
									isPrimitiveGraphQLType,
									handleFieldSelect,
									handleSetArgumentsClick,
									handleApplyClick,
									handleJumpIntoField,
									propType
								)
							)
						);
				}, [])
			},
			children: [],
		};
	}

	render() {
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

		const CONTENT_TYPE =
			!this.state.argumentsMode
			?
				this.state.currentPath.length - 1
				?	this.createContentType(
						this.props.schema.types[this._getCurrentPathByIndex(-1).type],
						this._getCurrentPathByIndex(-1),
						this.state.selectedFieldName,
						this.haveArguments(currentEditingFields[0]),
						this.breadcrumbs,
						this._getFieldTypeName,
						this._isPrimitiveGraphQLType,
						this._handleFieldSelect,
						this._handleSetArgumentsPress,
						this._handleDataApplyPress,
						this._handleJumpIntoField,
						this.createContentField,
						linkTargetPropTypedef.type
					)
				:	this.DataLayout
			:	this.createContentArgumentsType(
						currentEditingFields,
						this._getCurrentArguments(
							this.state.argumentsForCurrentPathLast,
							this.state.allArgumentsMode
						),
						this._getCurrentPathByIndex(
							this._isPrimitiveGraphQLType(
								this._getCurrentPathByIndex(-1).type)
						?	-2
						:	-1
						).name,
						this.haveArguments,
						this.createContentArgumentField,
						this._isPrimitiveGraphQLType,
						this._handleJumpIntoField,
						this._handleBackToPress,
						this._handleArgumentsApplyPress
					);

		return (
		<div className="data-window">
	        <Dialog
		        backdrop
		        visible={this.props.linkingProp}
				onClose={this.props.onLinkPropCancel}
		        haveCloseButton
				closeOnEscape
				closeOnBackdropClick
                scrollable
                buttonsLeft={CONTENT_TYPE.buttonsLeft}
                buttons={CONTENT_TYPE.buttons}
                paddingSize="none"
                title={`${this.props.linkingPropName} Data`}
                dialogContentFlex
	        >
                <div className="data-window_content">
                    <BlockContent>
                        <BlockContentNavigation isBordered>
                            <BlockBreadcrumbs
                                items={CONTENT_TYPE.breadcrumbs}
                                mode="dark"
								onItemClick={this._handleJumpToCurrentPathIndex}
                            />
                        </BlockContentNavigation>

                        <BlockContentBox isBordered>
                            <DataWindowContent
                                title={CONTENT_TYPE.content.title}
                                type={CONTENT_TYPE.content.type}
                                subtitle={CONTENT_TYPE.content.subtitle}
                                description={CONTENT_TYPE.content.description}
                                contentHeading={CONTENT_TYPE.content.contentHeading}
                                argsButton={CONTENT_TYPE.content.argsButton}
								onSetArgumentsClick={
									() => this._handleSetArgumentsPress(
										true
									)
								}
                                list={CONTENT_TYPE.content.list}
                                children={CONTENT_TYPE.content.children}
                            >

                            </DataWindowContent>
                        </BlockContentBox>
                    </BlockContent>
                </div>
	        </Dialog>
        </div>
    );
	}
}


DataWindowComponent.propTypes = {
	possiblePropDataTypes: PropTypes.arrayOf(PropTypes.string),

	schema: PropTypes.object,
	meta: PropTypes.object,
	linkingProp: PropTypes.bool,
	linkingPropOfComponentId: PropTypes.number,
	linkingPropName: PropTypes.string,
	linkingPropPath: PropTypes.array
};

DataWindowComponent.defaultProps = {
	dialogTitle: 'InitialComponent — PropName'
};

DataWindowComponent.displayName = 'DataWindow';

const mapStateToProps = state => ({
	schema: state.project.schema,
	meta: state.project.meta,
	linkingProp: state.project.linkingProp,
	linkingPropOfComponentId: state.project.linkingPropOfComponentId,
	linkingPropName: state.project.linkingPropName,
	linkingPropPath: state.project.linkingPropPath,
	components: currentComponentsSelector(state)
});

const mapDispatchToProps = dispatch => ({
	onLinkPropCancel: () =>
        void dispatch(linkPropCancel()),
	onUpdateComponentPropValue: (...args) =>
		void dispatch(updateComponentPropValue(...args))
});

export const DataWindow = connect(
	mapStateToProps,
	mapDispatchToProps
)(DataWindowComponent);
