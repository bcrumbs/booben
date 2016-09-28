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
	AccordionItem } from '../components/Accordion/Accordion';

import {
	ComponentTag,
	ComponentTagWrapper } from '../components/ComponentTag/ComponentTag';

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
		component: () => (
			<BlockContentBox>
				<Accordion>
					<AccordionItem title="Form">
						some accordion item
					</AccordionItem>
					<AccordionItem title="Text">
						some accordion item
					</AccordionItem>
					<AccordionItem title="Navigation" expanded>
						<ComponentTagWrapper>
							<ComponentTag title="Accordion" image="https://drscdn.500px.org/photo/118771829/m%3D2048/420d2f6430f878b8a0db28195b1ff8a3"/>
							<ComponentTag title="Block Content" focused />
							<ComponentTag title="Component Placeholder" />
							<ComponentTag title="Component Tag" />
							<ComponentTag title="Draggable Window" />
						</ComponentTagWrapper>
					</AccordionItem>
				</Accordion>
			</BlockContentBox>
		)
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

export default List([
    List([
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
 