/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/* eslint-disable */

import React from 'react';

import {
  App,
  TopRegion,
  BottomRegion,
  Button,
  Header,
  HeaderRegion,
  HeaderLogoBox,
  HeaderMenu,
  HeaderMenuList,
  HeaderMenuGroup,
  HeaderMenuItem,
  Footer,
  FooterRegion,
  FooterMenu,
  FooterMenuItem,
  FooterMenuGroup,
  FooterMenuList,
  Panel,
  PanelContent,
  ToggleButton,
} from '@reactackle/reactackle';

import {
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
  BlockContentPlaceholder,
} from '../components/BlockContent/BlockContent';

import {
  Accordion,
  AccordionItemRecord,
} from '../components/Accordion/Accordion';

import {
  ComponentTag,
  ComponentTagWrapper,
} from '../components/ComponentTag/ComponentTag';

import {
  ComponentsTree,
  ComponentsTreeList,
  ComponentsTreeItem,
} from '../components/ComponentsTree/ComponentsTree';

import {
  ComponentLayoutSelection,
  ComponentLayoutSelectionItem,
} from '../components/ComponentLayoutSelection/ComponentLayoutSelection';

import {
  ComponentActionEditing,
  ComponentActionsList,
} from '../components/ComponentInteractions/ComponentInteractions';

import { ProjectSave } from '../components/ProjectSave/ProjectSave';

import {
  DataList,
  DataItem,
} from '../components/DataList/DataList';

import {
  ConstructionTool,
} from '../components/ConstructionPane/ConstructionPane';

import { Desktop } from '../containers/Desktop/Desktop';

import ToolSectionRecord from '../models/ToolSection';
import ToolRecord from '../models/Tool';

import { List, Set } from 'immutable';

import { removeSplashScreen } from '../utils/dom';

// DATA
const toolIsolationSections = List([
  new ToolSectionRecord({
    name: 'Settings',
    component: () => (
      <BlockContentBox isBordered>
        <BlockContentBoxHeading>Size</BlockContentBoxHeading>
        <BlockContentBoxItem>
          <ConstructionTool />
        </BlockContentBoxItem>
      </BlockContentBox>
        ),
  }),
]);

// DATA
const toolDataSections = List([
  new ToolSectionRecord({
    name: 'Context',
    component: () => (
      <BlockContentBox>
        <BlockContentBoxHeading>Parent Props</BlockContentBoxHeading>
        <BlockContentBoxItem>
          <DataList>
            <DataItem
              title="SomeParentProp"
              type="type"
              subtitle="SomeParentProp - description"
              clickable
            />

            <DataItem
              title="SomeParentProp"
              type="type"
              subtitle="SomeParentProp - description"
              clickable
            />
          </DataList>
        </BlockContentBoxItem>
      </BlockContentBox>
        ),
  }),

  new ToolSectionRecord({
    name: 'Types',
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
        ),
  }),

  new ToolSectionRecord({
    name: 'Functions',
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
        ),
  }),
]);

// Components Library
const accordionItems = List([
  new AccordionItemRecord({
    id: 'tab1',
    title: 'Form',
    content: 'some accordion item',
  }),

  new AccordionItemRecord({
    id: 'tab2',
    title: 'Text',
    content: 'some accordion item',
  }),

  new AccordionItemRecord({
    id: 'tab3',
    title: 'Navigation',
    content: (
      <ComponentTagWrapper>
        <ComponentTag title="Accordion" image="https://drscdn.500px.org/photo/118771829/m%3D2048/420d2f6430f878b8a0db28195b1ff8a3" />
        <ComponentTag title="Block Content" focused />
        <ComponentTag title="Component Placeholder" />
        <ComponentTag title="Component Tag" />
        <ComponentTag title="Draggable Window" />
      </ComponentTagWrapper>
        ),
  }),
]);

const toolComponentsWindowSections = List([
  new ToolSectionRecord({
    name: 'Section 1',
    component: () => (
      <BlockContentBox isBordered>
        <Accordion single items={accordionItems} expandedItemIds={Set(['tab3'])} />
      </BlockContentBox>
        ),
  }),
]);

const toolComponentsPlaceholderWindowSections = List([
  new ToolSectionRecord({
    name: 'Section 1',
    component: () => (
      <BlockContentPlaceholder text="Ooops!">
        <Button text="Show All Components" />
      </BlockContentPlaceholder>
        ),
  }),
]);

const toolSitemapWindowSections = List([
  new ToolSectionRecord({
    name: 'Sitemap',
    component: () => (
      <BlockContentBox isBordered flex>
        <ComponentsTree>
          <ComponentsTreeItem title="routeA" showSublevel hasTooltip>
            <ComponentsTreeList>
              <ComponentsTreeItem title="Main Region" showSublevel hasTooltip>
                <ComponentsTreeList>
                  <ComponentsTreeItem title="Content" showSublevel hasTooltip>
                    <ComponentsTreeList>
                      <ComponentsTreeItem title="Components Tree" showSublevel hasTooltip>
                        <ComponentsTreeList>
                          <ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
                            <ComponentsTreeList>
                              <ComponentsTreeItem title="Components Tree Item" showSublevel hasTooltip />
                              <ComponentsTreeItem title="Some extremely long tree item item item item item item" hasTooltip showSublevel active />
                              <ComponentsTreeItem title="Another extremely long tree item item item item item item" hasTooltip />
                            </ComponentsTreeList>
                          </ComponentsTreeItem>
                        </ComponentsTreeList>
                      </ComponentsTreeItem>
                    </ComponentsTreeList>
                  </ComponentsTreeItem>
                </ComponentsTreeList>
              </ComponentsTreeItem>
            </ComponentsTreeList>
          </ComponentsTreeItem>
        </ComponentsTree>
      </BlockContentBox>
        ),
  }),
]);

// Component Props : Step 1 - template
const toolComponentTemplatesWindowSections = List([
  new ToolSectionRecord({
    name: 'Route Editing',
    component: () => (
      <BlockContentBox isBordered>
        <BlockContentBoxHeading>Component Templates</BlockContentBoxHeading>
        <BlockContentBoxItem>
          <ComponentLayoutSelection>
            <ComponentLayoutSelectionItem image={'http://img11.nnm.me/d/3/5/5/b/4d572a2fdc5b8c28cad40d9ca45.jpg'} title={'single block'} />
            <ComponentLayoutSelectionItem image={'http://cdn.pcwallart.com/images/cosmos-hd-wallpaper-3.jpg'} title={'2 equal parts'} />
            <ComponentLayoutSelectionItem image={'http://coolvibe.com/wp-content/uploads/2010/06/cosmos.jpg'} title={'3 equal parts'} />
            <ComponentLayoutSelectionItem image={'http://coolvibe.com/wp-content/uploads/2010/06/cosmos.jpg'} title={'2 equal parts, 1 full-height'} />
          </ComponentLayoutSelection>
        </BlockContentBoxItem>
      </BlockContentBox>
        ),
  }),
]);

// Component Props : Action Tab
const componentActionsList = [
  {
    title: 'Tap',
    description: 'Change "Component A" state to "State 1"',
  },
  {
    title: 'Mouse Over',
    description: 'Animate this: zoom in',
  },
];

const toolComponentActionsWindowSections = List([
  new ToolSectionRecord({
    name: 'Route Editing',
    component: () => (
      <BlockContentBox isBordered flex>
        <BlockContentBoxItem>
          <ComponentActionEditing />
        </BlockContentBoxItem>
        <BlockContentBoxItem isBordered flexMain>
          <ComponentActionsList items={componentActionsList} />
        </BlockContentBoxItem>
      </BlockContentBox>
        ),
  }),
]);

// TODO: Add tool id to this list when creating new tools
export const PLAYGROUND_TOOL_IDS = List([
  'tool5',
  'tool1',
  'tool2',
  'tool4',
  'tool6',
  'tool7',
  'tool8',
  'tool9',
]);

const toolGroups = List([
  List([
    new ToolRecord({
      id: 'tool9',
      icon: 'cog',
      name: 'Artboard Properties',
      title: 'Artboard Properties',
      undockable: true,
      closable: false,
      sections: toolIsolationSections,
      mainButtons: '',
      secondaryButtons: '',
    }),

    new ToolRecord({
      id: 'tool1',
      icon: 'file-text-o',
      name: 'Data',
      title: 'Data',
      undockable: true,
      closable: false,
      sections: toolDataSections,
      mainButtons: '',
      secondaryButtons: '',
    }),

    new ToolRecord({
      id: 'tool8',
      icon: 'play',
      name: 'Action Tab Content',
      title: 'Action Tab Content',
      undockable: true,
      closable: false,
      sections: toolComponentActionsWindowSections,
      mainButtons: '',
      secondaryButtons: '',
    }),

    new ToolRecord({
      id: 'tool7',
      icon: 'cog',
      name: 'Component Settings',
      title: 'Component Settings',
      undockable: true,
      closable: false,
      sections: toolComponentTemplatesWindowSections,
      mainButtons: '',
      secondaryButtons: '',
    }),

    new ToolRecord({
      id: 'tool6',
      icon: 'sitemap',
      name: 'Elements Tree',
      title: 'Elements Tree',
      undockable: true,
      closable: false,
      sections: toolSitemapWindowSections,
    }),

    new ToolRecord({
      id: 'tool2',
      icon: 'cube',
      name: 'Components Library',
      title: 'Components Library',
      undockable: true,
      closable: false,
      sections: toolComponentsWindowSections,
      mainButtons: '',
      secondaryButtons: '',
    }),

    new ToolRecord({
      id: 'tool4',
      icon: 'trash-o',
      name: 'Just Empty Tab',
      title: 'Just Empty Tab',
      undockable: true,
      closable: false,
      sections: toolComponentsPlaceholderWindowSections,
      mainButtons: '',
      secondaryButtons: '',
    }),
  ]),
]);

export default class Playground extends React.Component {
  componentDidMount() {
    removeSplashScreen();
  }
  
  render() {
    return (
      <App fixed>
        <TopRegion fixed={false}>
          <Header size="blank">
            <HeaderRegion size="blank">
              <HeaderLogoBox title="Project X" />
            </HeaderRegion>

            <HeaderRegion spread size="blank">
              <HeaderMenu inline dense>
                <HeaderMenu inline dense mode={'light'}>
                  <HeaderMenuGroup>
                    <HeaderMenuList>
                      <HeaderMenuItem text="Structure" />
                      <HeaderMenuItem text="Design">
                        <HeaderMenuGroup>
                          <HeaderMenuList>
                            <HeaderMenuItem text="User Route 1: index" />
                            <HeaderMenuItem text="User Route 2: aerial" />
                          </HeaderMenuList>
                        </HeaderMenuGroup>
                      </HeaderMenuItem>
                      <HeaderMenuItem text="Data" isActive />
                      <HeaderMenuItem text="Settings" />
                    </HeaderMenuList>
                  </HeaderMenuGroup>
                </HeaderMenu>
              </HeaderMenu>
            </HeaderRegion>

            <HeaderRegion size="blank">
              <ProjectSave status="error" />
            </HeaderRegion>

            <HeaderRegion size="blank">
              <HeaderMenu inline dense>
                <HeaderMenu inline dense mode={'light'}>
                  <HeaderMenuGroup>
                    <HeaderMenuList>
                      <HeaderMenuItem text="Preview" />
                      <HeaderMenuItem text="Publish" />
                    </HeaderMenuList>
                  </HeaderMenuGroup>
                </HeaderMenu>
              </HeaderMenu>
            </HeaderRegion>
          </Header>
        </TopRegion>

        <Desktop toolGroups={toolGroups}>
          <Panel headerFixed maxHeight="initial" spread>
            <PanelContent>
              Тут был старый DataWindow, но его победил Бэтмен.
              <img src="https://upload.wikimedia.org/wikipedia/en/1/17/Batman-BenAffleck.jpg" alt=""/>
            </PanelContent>
          </Panel>
        </Desktop>

        <BottomRegion fixed={false}>
          <Footer>
            <FooterRegion region="main" size="blank">
              <FooterMenu inline dense >
                <FooterMenuGroup>
                  <FooterMenuList>
                    <FooterMenuItem text="FAQ" />
                  </FooterMenuList>
                </FooterMenuGroup>
              </FooterMenu>
            </FooterRegion>
            <FooterRegion size="blank">
              <FooterMenu inline dense mode="light">
                <FooterMenuGroup>
                  <FooterMenuList>
                    <FooterMenuItem text="Show component's title" subcomponentRight={<ToggleButton />} />
                    <FooterMenuItem text="Show placeholders" subcomponentRight={<ToggleButton />} />
                    <FooterMenuItem text="Toggle fullscreen" />
                  </FooterMenuList>
                </FooterMenuGroup>
              </FooterMenu>
            </FooterRegion>
          </Footer>
        </BottomRegion>
      </App>
    );
  }
}
