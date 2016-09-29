/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

import { Button } from '@reactackle/reactackle';

import {
    BlockContentBox,
    BlockContentBoxItem,
    BlockContentBoxHeading,
	BlockContentPlaceholder
} from '../components/BlockContent/BlockContent';

import {
	Accordion,
	AccordionItemRecord
} from '../components/Accordion/Accordion';

import {
	ComponentTag,
	ComponentTagWrapper
} from '../components/ComponentTag/ComponentTag';

import {
	PropsList,
	PropsItem
} from '../components/PropsList/PropsList';

import { List } from 'immutable';

import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';
import ToolRecord from '../models/Tool';

const toolWindowSections = List([
    new ToolSectionRecord({
        name: 'Section 1',
        component: () => (
            <BlockContentBox>
                <BlockContentBoxHeading>Header 1</BlockContentBoxHeading>
                <BlockContentBoxItem>
                    Content block 1. Lorem ipsum dolor sit amet,
                    consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                </BlockContentBoxItem>

                <BlockContentBoxItem>
                    Content block 2. Lorem ipsum dolor sit amet,
                    consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                </BlockContentBoxItem>
            </BlockContentBox>
        )
    }),

    new ToolSectionRecord({
        name: 'Section 2',
        component: () => (
            <BlockContentBox>
                <BlockContentBoxHeading>Header 2</BlockContentBoxHeading>
                <BlockContentBoxItem>
                    Content block 3. Lorem ipsum dolor sit amet,
                    consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                </BlockContentBoxItem>

                <BlockContentBoxItem>
                    Content block 4. Lorem ipsum dolor sit amet,
                    consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                </BlockContentBoxItem>
            </BlockContentBox>
        )
    })
]);

const toolWindowMainActions = List([
    new ButtonRecord({
        text: 'Edit content',
        onPress: () => {}
    }),

    new ButtonRecord({
        text: 'Save',
        onPress: () => {}
    })
]);

const toolWindowSecondaryActions = List([
    new ButtonRecord({
        icon: 'trash-o',
        onPress: () => {}
    })
]);

// Components Library
const toolComponentsWindowSections = List([
	new ToolSectionRecord({
		name: 'Section 1',
		component: () => {
		    const accordionItems = List([
		        new AccordionItemRecord({
		            title: 'Form',
                    content: 'some accordion item'
                }),

                new AccordionItemRecord({
                    title: "Text",
                    content: 'some accordion item'
                }),

                new AccordionItemRecord({
                    title: 'Navigation',
                    content: (
                        <ComponentTagWrapper>
                            <ComponentTag title="Accordion" image="https://drscdn.500px.org/photo/118771829/m%3D2048/420d2f6430f878b8a0db28195b1ff8a3"/>
                            <ComponentTag title="Block Content" focused />
                            <ComponentTag title="Component Placeholder" />
                            <ComponentTag title="Component Tag" />
                            <ComponentTag title="Draggable Window" />
                        </ComponentTagWrapper>
                    )
                })
            ]);

		    return (
                <BlockContentBox>
                    <Accordion single items={accordionItems}/>
                </BlockContentBox>
            );
        }
	})
]);

const toolComponentsPlaceholderWindowSections = List([
	new ToolSectionRecord({
		name: 'Section 1',
		component: () => (
			<BlockContentPlaceholder text="Ooops!">
				<Button text='Show All Components' />
			</BlockContentPlaceholder>
		)
	})
]);

// Route Editing
const toolRouteWindowSections = List([
	new ToolSectionRecord({
		name: 'Route Editing',
		component: () => (
			<BlockContentBox>
				<BlockContentBoxHeading>Props Group 1</BlockContentBoxHeading>
				<BlockContentBoxItem>
					<PropsList>
						<PropsItem type="input" linkable label="Input Props"/>
						<PropsItem type="textarea" linkable label="Textarea Prop" />
						<PropsItem type="list" linkable label="List prop" />
						<PropsItem type="constructor" linkable label="Constructor Prop" />
						<PropsItem type="toggle" linkable label="Toggle prop" />
					</PropsList>
				</BlockContentBoxItem>

				<BlockContentBoxHeading>Props Group 2</BlockContentBoxHeading>
				<BlockContentBoxItem>
					<PropsList>
						<PropsItem type="array" label="Array Prop" />
					</PropsList>
				</BlockContentBoxItem>
			</BlockContentBox>
		)
	})
]);

const toolRouteWindowMainActions = List([
	new ButtonRecord({
		text: 'Save',
		onPress: () => {}
	})
]);

const toolRouteWindowSecondaryActions = List([
	new ButtonRecord({
		icon: 'trash-o',
		onPress: () => {}
	})
]);

export default List([
    List([
	    new ToolRecord({
		    id: 'tool5',
		    icon: 'cog',
		    name: 'Parsers',
		    title: 'Route Settings',
		    undockable: true,
		    closable: false,
		    sections: toolRouteWindowSections,
		    mainButtons: toolRouteWindowMainActions,
		    secondaryButtons: toolRouteWindowSecondaryActions
	    }),

        new ToolRecord({
            id: 'tool1',
            icon: 'cube',
            name: 'Components Library',
            title: 'Components Library',
            undockable: true,
            closable: false,
            sections: toolComponentsWindowSections,
            mainButtons: toolWindowMainActions, // Delete it
            secondaryButtons: toolWindowSecondaryActions // Delete it
        }),

	    new ToolRecord({
		    id: 'tool4',
		    icon: 'trash-o',
		    name: 'Just Empty Tab',
		    title: 'Just Empty Tab',
		    undockable: true,
		    closable: false,
		    sections: toolComponentsPlaceholderWindowSections,
		    mainButtons: toolWindowMainActions, // Delete it
		    secondaryButtons: toolWindowSecondaryActions // Delete it
	    }),

        new ToolRecord({
            id: 'tool2',
            icon: 'file-text-o',
            name: 'Data',
            title: 'Fuck you, i\'m drunk',
            undockable: true,
            closable: false,
            sections: toolWindowSections,
            mainButtons: toolWindowMainActions,
            secondaryButtons: toolWindowSecondaryActions
        }),

	    new ToolRecord({
		    id: 'tool3',
		    icon: 'sitemap',
		    name: 'Elements Tree',
		    title: 'Fuck you, i\'m drunk',
		    undockable: true,
		    closable: false,
		    sections: toolWindowSections,
		    mainButtons: toolWindowMainActions,
		    secondaryButtons: toolWindowSecondaryActions
	    })
    ])
]);
 