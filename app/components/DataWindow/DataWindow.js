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
	metaToGraphQLPrimitiveType
} from '../../utils/schema';

import {
	clone,
	objectFilter,
	objectSome
} from '../../utils/misc';

import {
	connect
} from 'react-redux';

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
			selectedFieldName: '',
		};
		this._handleJumpIntoField = this._handleJumpIntoField.bind(this);
		this._handleJumpToCurrentPathIndex =
			this._handleJumpToCurrentPathIndex.bind(this);
		this._handleFieldSelect = this._handleFieldSelect.bind(this);
		this._handleSetArgumentsClick = this._handleSetArgumentsClick.bind(this);
		this._handleDataApplyClick = this._handleDataApplyClick.bind(this);
		this._handleBackToPress = this._handleBackToPress.bind(this);
		this._getCurrentArguments = this._getCurrentArguments.bind(this);
	}

	_equalFieldPaths(path1, path2) {
		if (!path1 || !path2) return false;
		return ['name', 'type', 'kind'].every(
			name => path1[name] === path2[name]
		);
	}

	_handleJumpIntoField(name, type, kind, args, isCurrentPathLast) {
		const { previousPath, currentPath } = this.state;

		this.setState({
			argumentsPath: [],
			argumentsMode: false,
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
						isCurrentPathLast
						?	args
						:	args
							||	this._getCurrentArguments(name)
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
				selectedFieldName: ''
			});
	}

	_handleFieldSelect(selectedFieldName) {
		if (selectedFieldName !== this.state.selectedFieldName)
			this.setState({ selectedFieldName });
	}

	_handleSetArgumentsClick(argumentsForCurrentPathLast) {

		this.setState({
			argumentsMode: true,
			argumentsForCurrentPathLast,
		});
	}


	_handleDataApplyClick(fieldName) {

	}

	_handleBackToPress() {
		const argumentsMode = !!this.state.argumentsPath.length;
		if (this.state.argumentsMode)
			this.setState({
				argumentsPath: this.state.argumentsPath.slice(0, -1),
				argumentsMode,
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
					field.kind === 'CONNECTION'
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

	_getCurrentArguments(fieldName) {
		const previousPathField =
			this.state.previousPath[this.state.currentPath.length];

		if (this.state.currentPath.length === 1) return {};

		return !this.state.argumentsForCurrentPathLast
			?	previousPathField
				&&	this._equalFieldPaths(
					previousPathField,
					this.props.schema.types[this._getCurrentPathByIndex(-1).type]
						.fields[fieldName || this.state.selectedFieldName]
				)
				&&	previousPathField.args
			:	this._getCurrentPathByIndex(-1).args;

	}

	get currentEditingField() {
		const { types, queryTypeName } = this.props.schema;
		return this.state.currentPath.length > 2
			?	this.state.argumentsMode && !this.state.argumentsForCurrentPathLast
				?	types[this._getCurrentPathByIndex(-1).type]
							.fields[this.state.selectedFieldName]
				:	types[this._getCurrentPathByIndex(-2).type]
							.fields[this._getCurrentPathByIndex(-1).name]
			:	this.state.currentPath.length === 2
				&& !this.state.argumentsForCurrentPathLast && this.state.argumentsMode
				?	types[queryTypeName].fields[this.state.selectedFieldName]
				:	null;
	}

	get DataLayout() {
		return ({
		    content: {
		        list: [
		            {
		                title: "Query",
		                actionType: "jump",
		                connection: true,
						onSelect: () => this._handleJumpIntoField(
							'Query',
							this.props.schema.queryTypeName,
							'SINGLE'
						)
		            },
		            {
		                title: "Functions",
		                actionType: "jump",
		                connection: true
		            },
		            {
		                title: "Context",
		                actionType: "jump",
		                connection: true
		            },
		            {
		                title: "State",
		                actionType: "jump",
		                connection: true
		            }

		        ]
		    }
		});
	}


	createContentArgumentsType(
		field,
		fieldName,
		backToFieldName,
		args = {},
		handleFieldChange,
		handleJumpInto,
		handleBackToPress,
		handleJumpIntoField
	){
		let argsValue = clone(args);
		return (
			{
			    content: {
			        title: `${fieldName} arguments`,
			        subtitle: 'Please, fill required arguments',
			        description: field.description,
			        children: [
			                <PropsList key={1}>
							{
								 Object.keys(field.args).map(argName => {
									const arg = field.args[argName];
					                return (
										 <PropsItem
										 	key={argName}
					                        propType={{
					                            label: argName,
					                            view:
													graphQLPrimitiveTypes.has(arg.type)
													?
														arg.type === 'Boolean'
														?	'select'
														:	'input'
													:	'shape',
					                            type: arg.type,
					                            required: !arg.nonNull,
												notNull: arg.nonNull
					                        }}
											onChange={
												value =>
												argsValue[argName] = value
											}
											value={
												{ value: argsValue[argName] }
											}
					                    />
									);
								})
							}
			                </PropsList>
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
						onPress: () => handleJumpIntoField(
							fieldName,
							field.type,
							field.kind,
							argsValue,
							backToFieldName === fieldName,
						)
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
				connection: !graphQLPrimitiveTypes.has(field.type),
				canBeApplied: graphQLPrimitiveTypes.has(field.type),
				state: "error",
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
		createContentField
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
						field.kind === 'CONNECTION'
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
							handleJumpIntoField
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
									handleJumpIntoField
								)
							)
						);
				}, [])
			},
			children: [],
		};
	}

	render() {
		const { currentEditingField } = this;
		const CONTENT_TYPE =
			!this.state.argumentsMode
			?
				this.state.currentPath.length - 1
				?	this.createContentType(
						this.props.schema.types[this._getCurrentPathByIndex(-1).type],
						this._getCurrentPathByIndex(-1),
						this.state.selectedFieldName,
						!!(currentEditingField
							&& Object.keys(
								currentEditingField.args
							).length
						),
						this.breadcrumbs,
						this._getFieldTypeName,
						this._handleFieldSelect,
						this._handleSetArgumentsClick,
						this._handleDataApplyClick,
						this._handleJumpIntoField,
						this.createContentField
					)
				:	this.DataLayout
			:	this.createContentArgumentsType(
					currentEditingField,
					currentEditingField.name,
					this._getCurrentPathByIndex(-1).name,
					this._getCurrentArguments(),
					this._handleArgsChange,
					this._handleJumpIntoField,
					this._handleBackToPress,
					this._handleJumpIntoField
			);
		return (
		<div className="data-window">
	        <Dialog
		        backdrop
		        visible
		        haveCloseButton
                scrollable
                buttonsLeft={CONTENT_TYPE.buttonsLeft}
                buttons={CONTENT_TYPE.buttons}
                paddingSize="none"
                title="%PropName% Data"
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
									() => this._handleSetArgumentsClick(
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
	dialogTitle: PropTypes.string,
	possibleDataTypes: PropTypes.arrayOf(PropTypes.string),

	schema: PropTypes.object,
	meta: PropTypes.object

};

DataWindowComponent.defaultProps = {
	dialogTitle: 'InitialComponent — PropName'
};

DataWindowComponent.displayName = 'DataWindow';

const mapStateToProps = state => ({
	schema: state.project.schema,
	meta: state.project.met
});

export const DataWindow = connect(
	mapStateToProps
)(DataWindowComponent);
