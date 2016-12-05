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
	BlockContentBoxItem,
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

import { FunctionArgumentsList } from '../FunctionArgumentsList/FunctionArgumentsList';
import { FunctionEditor } from '../FunctionEditor/FunctionEditor';

import './DataWindow.scss';

const SAMPLE_STEP_ONE = {
    breadcrumbs: [],
    content: {
        title: "",
        subtitle: "",
        description: "",
        backButton: false,
        list: [
            {
                title: "Query",
                actionType: "jump",
                connection: true
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
    },
    actions: []
};
const SAMPLE_FUNCS_LIST = {
    breadcrumbs: [],
    content: {
        title: "",
        subtitle: "",
        description: "",
        backButton: false,
        list: [
            {
                title: "Randomize",
                description: "Randomizer description",
                actionType: "jump",
                connection: true
            },
            {
                title: "Average",
                description: "Some description",
                actionType: "jump",
                connection: true
            }
        ]
    },
    actions: []
};
const SAMPLE_FUNCTION_INFO = {
    breadcrumbs:[
        { title: 'Functions '},
        {
            title: 'Average',
            isActive: true
        }
    ],
    
    content: {
        title: "Average (Func title)",
        type: "averageFuncName | output: string",
        description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. ",
        list: [],
        children: [
            <PropsList>
                <PropsItem
                    propType={{
                        label: 'Variable a',
                        view: 'input',
                        type: 'int',
                        required: true,
                        linkable: true
                    }}
                    value={{
                        value: ''
                    }}
                />
                <PropsItem
                    propType={{
                        label: 'Variable b',
                        view: 'input',
                        type: 'int',
                        required: true,
                        linkable: true
                    }}
                    value={{
                        value: ''
                    }}
                />
                <PropsItem
                    propType={{
                        label: 'Variable c',
                        view: 'input',
                        type: 'int',
                        required: true,
                        linkable: true
                    }}
                    value={{
                        value: ''
                    }}
                />
            </PropsList>
        ],
    },
    buttonsLeft: [
        {
            text: 'Functions',
            subtitle: 'back to',
            icon: 'chevron-left'
        }
    ],
    buttons: [
        {text: 'Apply'}
    ]
};
const SAMPLE_NEW_FUNCTION = {
    breadcrumbs: [],
    content: {
        title: "New Function",
        subtitle: "",
        description: "",
        backButton: false,
        list: [],
        children: [
            <BlockContentBoxItem>
                <PropsList>
                    <PropsItem
                        propType={{
                            label: 'Function title',
                            view: 'input'
                        }}
                        value={{
                            value: ''
                        }}
                    />
                    <PropsItem
                        propType={{
                            label: 'Output type',
                            type: 'Выводим через SelectBox (list)',
                            view: 'input'
                        }}
                        value={{
                            value: ''
                        }}
                    />
                    <PropsItem
                        propType={{
                            label: 'Description',
                            view: 'textarea'
                        }}
                        value={{
                            value: ''
                        }}
                    />
                </PropsList>
            </BlockContentBoxItem>,
            <FunctionArgumentsList />
        ],
    },
    buttons: [
        {text: 'Cancel'},
        {text: 'Next'}
    ]
};
const SAMPLE_FUNCTION_EDITOR = {
    content: {
        children: [
            <FunctionEditor />
        ],
    },
    buttons: [
        {text: 'Cancel'},
        {text: 'Save'}
    ]
};

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
        title: "Arguments Required",
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
                            itemRequired: true,
                            requirementFullfilled: true
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
                            itemRequired: true
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

const CONTENT_TYPE = SAMPLE_FUNCTION_EDITOR;

export const DataWindow= props => {
    let breadcrumbs = null;
    if (CONTENT_TYPE.breadcrumbs)
        breadcrumbs =
            <BlockContentNavigation isBordered>
                <BlockBreadcrumbs
                    items={CONTENT_TYPE.breadcrumbs}
                    mode="dark"
                />
            </BlockContentNavigation>;
    
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
                        { breadcrumbs }
    
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
};

DataWindow.propTypes = {
	dialogTitle: PropTypes.string
};

DataWindow.defaultProps = {
	dialogTitle: 'InitialComponent — PropName'
};

DataWindow.displayName = 'DataWindow';

