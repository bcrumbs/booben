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
	graphQLPrimitiveTypes
} from '../../utils/schema';

import {
	connect
} from 'react-redux';

import './DataWindow.scss';

const SAMPLE_TYPE = {
    breadcrumbs: [
        {title: 'Data'},
        {title: 'allMonkeys'}
    ],

    content: {
        title: "allMonkeys",
        type: "type: Monkey",
        description: "Some allMonkeys description",
        argsButton: true,
        contentHeading: 'Fields',
        list: [
            {
                title: "SomeField1",
                type: "string",
                tooltip: "Some description",
                actionType: "select",
                clickable: true,
                required: true,
                argsButton: true,
                chosen: true,
                connection: true,
                state: "error"
            },
            {
                title: "SomeField2",
                type: "object",
                tooltip: "Some description",
                actionType: "select",
                clickable: true,
                required: true,
                argsButton: true,
                chosen: false,
                connection: true,
                state: "error"
            },
            {
                title: "SomeField3",
                type: "string",
                tooltip: "Some description",
                actionType: "select",
                clickable: true,
                required: true,
                argsButton: true,
                chosen: false,
                connection: false,
                state: "success"
            }

        ]
    },
    actions: []
};

const SAMPLE_ARGUMENTS = {
    breadcrumbs:[],

    content: {
        title: "SomeField2 Args",
        subtitle: "",
        description: "",
        list: [],
        children: [
            <PropsList>
                <PropsItem
                    propType={{
                        subcomponentLeft: <Checkbox  label=""/>,
                        label: 'eatBananas',
                        view: 'toggle',
                        type: 'bool',
                        required: true
                    }}
                    value={{
                        value: ''
                    }}
                />
                <PropsItem
                    propType={{
                        subcomponentLeft: <Checkbox label=""/>,
                        label: 'filter',
                        view: 'shape',
                        type: 'filterType',
                        required: true
                    }}
                    value={{
                        value: ''
                    }}
                >
                    <PropsItem
                        propType={{
                            subcomponentLeft: <Checkbox />,
                            label: 'country',
                            view: 'input',
                            type: 'string'
                        }}
                        value={{
                            value: ''
                        }}
                    />
                    <PropsItem
                        propType={{
                            subcomponentLeft: <Checkbox />,
                            label: 'population',
                            view: 'input',
                            type: 'int'
                        }}
                        value={{
                            value: ''
                        }}
                    />
                </PropsItem>
            </PropsList>
        ],
    },
    buttonLeft: [
        {
            text: '%Somewhere%',
            subtitle: 'back to',
            icon: 'chevron-left'
        }
    ],
    buttons: [
        {text: 'Apply'}
    ]
};

const SAMPLE_ARGUMENTS_TOTAL = {
    breadcrumbs:[],

    content: {
        title: "Argument",
        subtitle: "Please, fill required arguments",
        description: "",
        list: [],
        children: [
            <DataWindowContentGroup title="allMonkeys" subtitle="data > allMonkeys">
                <PropsList>
                    <PropsItem
                        propType={{
                            subcomponentLeft: <Checkbox  label=""/>,
                            label: 'eatBananas',
                            view: 'toggle',
                            type: 'bool',
                            required: true
                        }}
                        value={{
                            value: ''
                        }}
                    />
                    <PropsItem
                        propType={{
                            subcomponentLeft: <Checkbox label=""/>,
                            label: 'filter',
                            view: 'shape',
                            type: 'filterType',
                            required: true
                        }}
                        value={{
                            value: ''
                        }}
                    >
                        <PropsItem
                            propType={{
                                subcomponentLeft: <Checkbox />,
                                label: 'country',
                                view: 'input',
                                type: 'string'
                            }}
                            value={{
                                value: ''
                            }}
                        />
                        <PropsItem
                            propType={{
                                subcomponentLeft: <Checkbox />,
                                label: 'population',
                                view: 'input',
                                type: 'int'
                            }}
                            value={{
                                value: ''
                            }}
                        />
                    </PropsItem>
                </PropsList>
            </DataWindowContentGroup>,
            <DataWindowContentGroup title="someField" subtitle="data > allMonkeys > someField">
                <PropsList>
                    <PropsItem
                        propType={{
                            subcomponentLeft: <Checkbox  label=""/>,
                            label: 'eatBananas',
                            view: 'toggle',
                            type: 'bool',
                            required: true
                        }}
                        value={{
                            value: ''
                        }}
                    />
                    <PropsItem
                        propType={{
                            subcomponentLeft: <Checkbox />,
                            label: 'country',
                            view: 'input',
                            type: 'string'
                        }}
                        value={{
                            value: ''
                        }}
                    />
                </PropsList>
            </DataWindowContentGroup>
        ],
    },
    buttonsLeft: [
        {
            text: '%Somewhere%',
            subtitle: 'back to',
            icon: 'chevron-left'
        }
    ],
    buttons: [
        {text: 'Apply'}
    ]
};

const CONTENT_TYPE = SAMPLE_TYPE;

class DataWindowComponent extends PureComponent {
	constructor(props){
		super(props);
		this.state = {
			currentPath: [
				{ title: 'Data' }
			],
			argumentsPath: [],
			argumentsMode: false,
			selectedFieldName: '',
		};
		this._handleJumpIntoField = this._handleJumpIntoField.bind(this);
		this._handleJumpToCurrentPathIndex =
			this._handleJumpToCurrentPathIndex.bind(this);
		this._handleFieldSelect = this._handleFieldSelect.bind(this);
		this._handleSetArgumentsClick = this._handleSetArgumentsClick.bind(this);
		this._handleApplyClick = this._handleApplyClick.bind(this);
		this._handleBackToPress = this._handleBackToPress.bind(this);
		this._handleArgumentsApply = this._handleArgumentsApply.bind(this);
	}

	_handleJumpIntoField(title, typeName, kind, args) {
		console.log(args)
		this.setState({
			argumentsPath: [],
			argumentsMode: false,
			currentPath: [...this.state.currentPath, { title, typeName, kind, args }]
		});
	}

	_handleJumpToCurrentPathIndex(index) {
		if (index + 1 !== this.state.currentPath.length)
			this.setState({
				currentPath: this.state.currentPath.slice(
					0,
					index + 1
				),
				selectedFieldName: ''
			});
	}

	_handleFieldSelect(selectedFieldName) {
		if (selectedFieldName !== this.state.selectedFieldName)
			this.setState({ selectedFieldName });
	}

	_handleSetArgumentsClick() {
		this.setState({ argumentsMode: true });
	}

	_handleArgumentsApply(jumpIntoField, ...args) {
		if (jumpIntoField) this._handleJumpIntoField(...args);
		else
			this.setState({
				argumentsPath: [],
				argumentsMode: false,
				currentPath: [...this.state.currentPath.slice(0, -1),
					args
				]
			});
	}

	_handleApplyClick(fieldName) {

	}

	_handleBackToPress() {
		if (this.state.argumentsMode)
			this.setState({
				argumentsPath: this.state.argumentsPath.slice(0, -1),
				argumentsMode: !!this.state.argumentsPath.length
			});
		else
			this._handleJumpToCurrentPathIndex(this.state.currentPath.length - 2);
	}



	get breadcrumbs() {
		return this.state.currentPath.map(
			({ title }) => ({
				title
			})
		);
	}

	get currentPathLast() {
		return this.state.currentPath[this.state.currentPath.length - 1];
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
		handleFieldChange,
		handleJumpInto,
		handleBackToPress,
		handleArgumentsApply
	){
		let argsValue = {};
		return (
			{
			    content: {
			        title: `${fieldName} arguments`,
			        subtitle: "Please, fill required arguments",
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

					                            required: true
					                        }}
											onChange={value =>
												argsValue[argName] = value
											}
											value={
												null
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
						onPress: () => handleArgumentsApply(
							backToFieldName !== fieldName,
							fieldName,
							field.type,
							field.kind,
							argsValue
						)
					}
			    ]
			}
		);
	}

	createContentType(
		types,
		currentPathLast,
		selectedFieldName,
		breadcrumbs,
		handleFieldSelect,
		handleSetArgumentsClick,
		handleApplyClick,
		handleJumpIntoField,
		handleBackToPress
	) {
		const type = types[currentPathLast.typeName];
		return {
			breadcrumbs,
			content: {
				title: currentPathLast.title,
				subtitle: `type: ${
					currentPathLast.typeName
					+ (
						currentPathLast.kind === 'CONNECTION'
						? ' connection'
						: ''
					)
				}`,
				description: type.description,
				argsButton: true,
		        contentHeading: 'Fields',
				list: Object.keys(type.fields).map(fieldName => {
					const field = type.fields[fieldName];
					return (
						{
			                title: fieldName,
			                type: field.type,
			                tooltip: field.description,
			                actionType: 'select',
			                clickable: true,
			                required: true,
			                argsButton: !!Object.keys(field.args).length,
			                chosen: fieldName === selectedFieldName,
			                connection: !graphQLPrimitiveTypes.has(field.type),
							canBeApplied: true,
			                state: "error",
							onSelect: () => handleFieldSelect(fieldName),
							onApplyClick: () => handleApplyClick(fieldName),
							onSetArgumentsClick: () => handleSetArgumentsClick(fieldName),
							onJumpIntoClick: () => handleJumpIntoField(
								fieldName,
								field.type,
								field.kind
							)
			            }
					);

				})
			},
			children: [],
		};
	}

	render() {
		const CONTENT_TYPE =
			!this.state.argumentsMode
			?
				this.state.currentPath.length - 1
				?	this.createContentType(
						this.props.schema.types,
						this.currentPathLast,
						this.state.selectedFieldName,
						this.breadcrumbs,
						this._handleFieldSelect,
						this._handleSetArgumentsClick,
						this._handleApplyClick,
						this._handleJumpIntoField,
						this._handleBackToPress
					)
				:	this.DataLayout
			:	this.createContentArgumentsType(
					this.props.schema.types[this.currentPathLast.typeName].fields[this.state.selectedFieldName],
					this.state.selectedFieldName,
					this.currentPathLast.title,
					this._handleArgsChange,
					this._handleJumpIntoField,
					this._handleBackToPress,
					this._handleArgumentsApply
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

	schema: PropTypes.object
};

DataWindowComponent.defaultProps = {
	dialogTitle: 'InitialComponent — PropName'
};

DataWindowComponent.displayName = 'DataWindow';

const mapStateToProps = state => ({
	schema: state.project.schema
});

export const DataWindow = connect(
	mapStateToProps
)(DataWindowComponent);
