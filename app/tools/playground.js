/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

import {
    BlockContentBox,
    BlockContentBoxItem,
    BlockContentBoxHeading
} from '../components/BlockContent/BlockContent';

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

export default List([
    List([
        new ToolRecord({
            id: 'tool1',
            icon: 'cube',
            name: 'Tool 1',
            title: 'Hey ho lets go',
            undockable: true,
            closable: false,
            sections: toolWindowSections,
            mainButtons: toolWindowMainActions,
            secondaryButtons: toolWindowSecondaryActions
        }),

        new ToolRecord({
            id: 'tool2',
            icon: 'server',
            name: 'Tool 2',
            title: 'Fuck you, i\'m drunk',
            undockable: true,
            closable: false,
            sections: toolWindowSections,
            mainButtons: toolWindowMainActions,
            secondaryButtons: toolWindowSecondaryActions
        })
    ])
]);
 