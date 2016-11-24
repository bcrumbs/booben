'use strict';

import React, { PureComponent, PropTypes } from 'react';

import {
	Button,
	Breadcrumbs,
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

import { DataWindowContent } from './DataWindowContent/DataWindowContent';

import './DataWindow.scss';

const SAMPLE_DATA = [
	{ title: 'Query' },
	{ title: 'AllMonkeys' }
];

const SAMPLE_CONTENT = {
    title: "AllMonkeys",
    subtitle: "type: object",
    description: "Some AllMonkeys description",
    backButton: false,
    list: [
        {
            title: "SomeProp1",
            type: "string",
            tooltip: "Some description",
            description: "some description",
            required: true,
            argsButton: true,
            argsRequired: true,
            chosen: true,
            connection: true
        },
        {
            title: "SomeProp2",
            type: "object",
            tooltip: "Some description",
            description: "some description",
            required: true,
            argsButton: false,
            argsRequired: true,
            chosen: false,
            connection: false
        },
        {
            title: "SomeProp3",
            type: "string",
            tooltip: "Some description",
            required: true,
            argsButton: true,
            argsRequired: true,
            chosen: false,
            connection: false
        }
        
    ]
};

const SAMPLE_ARGUMENTS_WINDOW = {
    title: "SomeField2 Args",
    subtitle: "type: object",
    description: "Some AllMonkeys description",
    backButton: true,
    list: []
};

const DIALOG_BUTTONS = [
    { text: 'Apply' }
];

export const DataWindow= props => {
    return (
        <div className="data-window">
	        <Dialog
		        backdrop
		        visible
		        haveCloseButton
                scrollable
                windowTitle={props.dialogTitle}
                buttons={DIALOG_BUTTONS}
                paddingSize="none"
                dialogContentFlex
	        >
		        <BlockContent>
			        <BlockContentTitle title="PropName Data"/>

			        <BlockContentNavigation isBordered>
				        <BlockBreadcrumbs
					        items={SAMPLE_DATA}
					        mode="dark"
				        />
			        </BlockContentNavigation>

			        <BlockContentBox isBordered>
                        <DataWindowContent
                            title={SAMPLE_ARGUMENTS_WINDOW.title}
                            subtitle={SAMPLE_ARGUMENTS_WINDOW.subtitle}
                            description={SAMPLE_ARGUMENTS_WINDOW.description}
                            list={SAMPLE_ARGUMENTS_WINDOW.list}
                            backButton={SAMPLE_ARGUMENTS_WINDOW.backButton}
                        >
                            <PropsList>
                                <PropsItem
                                    type="bool"
                                    view="toggle"
                                    label="eatBananas"
                                />
                                <PropsItem
                                    type="filterType"
                                    view="tree"
                                    label="filter"
                                    subtreeOn
                                >
                                    <PropsItem
                                        type="string"
                                        view="input"
                                        label="country"
                                    />
                                    <PropsItem
                                        type="int"
                                        view="input"
                                        label="population"
                                    />
                                </PropsItem>
                            </PropsList>
                        </DataWindowContent>
                    </BlockContentBox>
		        </BlockContent>
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
