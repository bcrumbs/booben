/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

import {
    App,
    TopRegion,
    MainRegion,
    BottomRegion,
    Header,
    HeaderRegion,
    HeaderLogoBox,
    HeaderMenu,
    HeaderMenuList,
    HeaderMenuItem,
    HeaderTitle,
    Content,
    Panel,
    PanelContent,
    Tabs,
    Tab,
    Row,
    Button,
    Footer,
    FooterRegion,
    FooterMenu,
    FooterMenuItem,
    ToggleButton
} from '@reactackle/reactackle';

import {
    BlockContent,
    BlockContentTitle,
    BlockContentNavigation,
    BlockContentBox,
    BlockContentBoxItem,
    BlockContentBoxHeading,
    BlockContentActions,
    BlockContentActionsRegion,
    BlockContentPlaceholder
} from './BlockContent/BlockContent';

import {
    PageDrawer,
    PageDrawerActionsArea,
    PageDrawerActionsGroup,
    PageDrawerActionItem,
    PageDrawerActionPlaceholder,
    PageDrawerContentArea
} from './PageDrawer/PageDrawer';


import { ComponentPlaceholder } from './ComponentPlaceholder/ComponentPlaceholder';
import { ToolWindow } from './ToolWindow/ToolWindow';
import { ToolPanel } from './ToolPanel/ToolPanel';


const toolWindowSections = [
    {
        name: 'Section 1',
        component: () => (
            <BlockContentBox>
                <BlockContentBoxHeading>Header 1</BlockContentBoxHeading>
                <BlockContentBoxItem>
                    Content block 1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                </BlockContentBoxItem>

                <BlockContentBoxItem>
                    Content block 2. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                </BlockContentBoxItem>
            </BlockContentBox>
        )
    },

    {
        name: 'Section 2',
        component: () => (
            <BlockContentBox>
                <BlockContentBoxHeading>Header 2</BlockContentBoxHeading>
                <BlockContentBoxItem>
                    Content block 3. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                </BlockContentBoxItem>

                <BlockContentBoxItem>
                    Content block 4. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
                </BlockContentBoxItem>
            </BlockContentBox>
        )
    }
];

const toolWindowMainActions = [
    {
        text: 'Edit content',
        onPress: () => {}
    },
    {
        text: 'Save',
        onPress: () => {}
    }
];

const toolWindowSecondaryActions = [
    {
        icon: 'trash-o',
        onPress: () => {}
    }
];

export default class Playground extends React.Component {
    constructor(props) {
        super(props);
    }

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
                                {/*<MenuComposer data={list1} />*/}


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

                <MainRegion>
                    <Content>
                        <ToolWindow
                            title="Move me"
                            subtitle="I'm a little movable window"
                            sections={toolWindowSections}
                            mainButtons={toolWindowMainActions}
                            secondaryButtons={toolWindowSecondaryActions}
                        />
                    </Content>

                    <PageDrawer isExpanded>
                        <PageDrawerActionsArea>
                            <PageDrawerActionsGroup>
                                <PageDrawerActionItem icon='cube' title="Component Props" isActive={true} />
                                <PageDrawerActionItem icon='file-text-o' title="Data"/>
                                <PageDrawerActionItem icon='sitemap' title="Elements Tree"/>
                                <PageDrawerActionPlaceholder />
                            </PageDrawerActionsGroup>
                        </PageDrawerActionsArea>

                        <ToolPanel
                            title="Don't move me"
                            sections={toolWindowSections}
                            mainButtons={toolWindowMainActions}
                            secondaryButtons={toolWindowSecondaryActions}
                        />

                    </PageDrawer>
                </MainRegion>

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
