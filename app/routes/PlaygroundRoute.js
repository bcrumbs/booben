/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

import {
    App,
    TopRegion,
    BottomRegion,
    Header,
    HeaderRegion,
    HeaderLogoBox,
    HeaderMenu,
    HeaderMenuItem,
    Footer,
    FooterRegion,
    FooterMenu,
    FooterMenuItem,
    ToggleButton
} from '@reactackle/reactackle';

import {
    BlockContentBox,
    BlockContentBoxItem,
    BlockContentBoxHeading
} from '../components/BlockContent/BlockContent';

import { Desktop } from '../containers/Desktop/Desktop';

import { List } from 'immutable';

import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';
import ToolRecord from '../models/Tool';

import store from '../store';
import { addTools } from '../actions/desktop';


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

const toolGroups = List([
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

store.dispatch(addTools(toolGroups));

export default class Playground extends React.Component {
    render() {
        return (
            <App fixed={true}>
                <TopRegion fixed={false}>
                    <Header size="blank">
                        <HeaderRegion size='blank'>
                            <HeaderLogoBox title="Project X"/>
                        </HeaderRegion>

                        <HeaderRegion region="main" size='blank'>
                            <HeaderMenu inline={true}  dense={true}>
                                <HeaderMenuItem text="Structure" />
                                <HeaderMenuItem text="Design">
                                    <HeaderMenuItem text="User Route 1: index" />
                                    <HeaderMenuItem text="User Route 2: aerial" />
                                </HeaderMenuItem>
                                <HeaderMenuItem text="Data" isActive={true}/>
                                <HeaderMenuItem text="Settings" />
                            </HeaderMenu>
                        </HeaderRegion>

                        <HeaderRegion size='blank'>
                            <HeaderMenu inline={true}  dense={true}>
                                <HeaderMenuItem text="Preview" />
                                <HeaderMenuItem text="Publish" />
                            </HeaderMenu>
                        </HeaderRegion>
                    </Header>
                </TopRegion>

                <Desktop toolGroups={toolGroups}/>

                <BottomRegion fixed={false}>
                    <Footer>
                        <FooterRegion region="main" size='blank'>
                            <FooterMenu inline={true}  dense={true}>
                                <FooterMenuItem text="FAQ"/>
                            </FooterMenu>
                        </FooterRegion>
                        <FooterRegion size='blank'>
                            <FooterMenu inline={true}  dense={true}>
                                <FooterMenuItem text="Show component's title" subcomponentRight={<ToggleButton />} />
                                <FooterMenuItem text="Show placeholders" subcomponentRight={<ToggleButton />}/>
                                <FooterMenuItem text="Toggle Full Screen"/>
                            </FooterMenu>
                        </FooterRegion>
                    </Footer>
                </BottomRegion>
            </App>
        );
    }
}
