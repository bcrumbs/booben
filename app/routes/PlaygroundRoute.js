/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

import {
    App,
    TopRegion,
    BottomRegion,
  Button,
  Breadcrumbs,
  Column,
  Container,
  Dialog,
  DialogContent,
    Header,
    HeaderRegion,
  HeaderTitle,
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
  Row,
  Tabs,
  Tab,
    ToggleButton,
} from '@reactackle/reactackle';

import {
  RoutesList,
  RouteCard,
  RouteNewButton,
} from '../components/RoutesList/RoutesList';

import {
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
  BlockBreadcrumbs,
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
  PropsList,
  PropsItem,
} from '../components/PropsList/PropsList';

import {
  ComponentLayoutSelection,
  ComponentLayoutSelectionItem,
} from '../components/ComponentLayoutSelection/ComponentLayoutSelection';

import {
  ComponentActionEditing,
  ComponentActionsList,
} from '../components/ComponentInteractions/ComponentInteractions';

import { HeaderRoute } from '../components/HeaderRoute/HeaderRoute';
import { ProjectSave } from '../components/ProjectSave/ProjectSave';
import { DataWindow } from '../containers/DataWindow/DataWindow';

import {
  DataList,
  DataItem,
} from '../components/DataList/DataList';

import {
  ConstructionPane,
  ConstructionTool,
} from '../components/ConstructionPane/ConstructionPane';

import { Desktop } from '../containers/Desktop/Desktop';

import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';
import ToolRecord from '../models/Tool';

import { List, Set } from 'immutable';

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
        <ComponentTag title="Accordion" image="https://drscdn.500px.org/photo/118771829/m%3D2048/420d2f6430f878b8a0db28195b1ff8a3"/>
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
        <Accordion single items={accordionItems} expandedItemIds={Set(['tab3'])}/>
      </BlockContentBox>
    ),
  }),
]);

const toolComponentsPlaceholderWindowSections = List([
  new ToolSectionRecord({
    name: 'Section 1',
    component: () => (
      <BlockContentPlaceholder text="Ooops!">
        <Button text='Show All Components' />
      </BlockContentPlaceholder>
    ),
  }),
]);

// Route Editing
const treeItems = [
  {
    title: 'prop-1',
    subtitle: 'object',
  },
  {
    title: 'buttons',
    subtitle: 'object',
    isActive: true,
  },
];

const toolRouteWindowSections = List([
  new ToolSectionRecord({
    name: 'Route Editing',
    component: () => (
      <BlockContentBox isBordered>
        <BlockContentBoxHeading>Tree Prop</BlockContentBoxHeading>

        <BlockContentBoxItem>
          <PropsList/>
        </BlockContentBoxItem>

      </BlockContentBox>
    ),
  }),
]);

const toolRouteWindowMainActions = List([
  new ButtonRecord({
    text: 'Save',
    onPress: () => {},
  }),
]);

const toolRouteWindowSecondaryActions = List([
  new ButtonRecord({
    icon: 'trash-o',
    onPress: () => {},
  }),
]);

// Route Editing

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
                              <ComponentsTreeItem title="Components Tree Item" showSublevel hasTooltip/>
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

const sampleData = [
  {
    value: '1',
    text: 'item 1',
  },
  {
    value: '2',
    text: 'item 2',
  },
  {
    value: '3',
    text: 'item 3',
  },
];

// Component Props : Step 2 - layout
const toolComponentLayoutWindowSections = List([
  new ToolSectionRecord({
    name: 'Route Editing',
    component: () => (
      <BlockContentBox isBordered>
        <BlockContentBoxHeading>Prop View: Input</BlockContentBoxHeading>
        <BlockContentBoxItem>
          {/* <PropsItem*/}
          {/* view="input"*/}
          {/* label="without type"*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="input"*/}
          {/* label="some very-very-very extremely long prop label"*/}
          {/* type="string"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* value="typeA.fieldB"*/}
          {/* linkable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="input"*/}
          {/* label="disabled prop"*/}
          {/* type="string"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* value="typeA.fieldB"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="input"*/}
          {/* label="disabled prop"*/}
          {/* type="string"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* value="typeA.fieldB"*/}
          {/* image="http://www.funny-animalpictures.com/media/content/items/images/funnyowls0074_O.jpg"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* disabled*/}
          {/* />*/}
        </BlockContentBoxItem>

        <BlockContentBoxHeading>Prop View: textarea</BlockContentBoxHeading>
        <BlockContentBoxItem>
          {/* <PropsItem*/}
          {/* view="textarea"*/}
          {/* label="without type"*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="textarea"*/}
          {/* label="some very-very-very extremely long prop label"*/}
          {/* type="string"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* value="typeA.fieldB"*/}
          {/* linkable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="textarea"*/}
          {/* label="disabled prop"*/}
          {/* type="string"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* value="typeA.fieldB"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="textarea"*/}
          {/* label="disabled prop"*/}
          {/* type="string"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* value="typeA.fieldB"*/}
          {/* image="http://www.funny-animalpictures.com/media/content/items/images/funnyowls0074_O.jpg"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* disabled*/}
          {/* />*/}
        </BlockContentBoxItem>

        <BlockContentBoxHeading>Prop View: constructor</BlockContentBoxHeading>
        <BlockContentBoxItem>
          {/* <PropsItem*/}
          {/* view="constructor"*/}
          {/* label="without type"*/}
          {/* setComponentButtonText="Set Component"*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="constructor"*/}
          {/* label="some very-very-very extremely long prop label"*/}
          {/* type="constructor"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* setComponentButtonText="Set Component"*/}
          {/* linkable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="constructor"*/}
          {/* label="disabled prop"*/}
          {/* type="constructor"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* setComponentButtonText="Set Component"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="constructor"*/}
          {/* label="disabled prop"*/}
          {/* type="constructor"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* image="http://www.funny-animalpictures.com/media/content/items/images/funnyowls0074_O.jpg"*/}
          {/* setComponentButtonText="Set Component"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* disabled*/}
          {/* />*/}
        </BlockContentBoxItem>

        <BlockContentBoxHeading>Prop View: constructor-toggle</BlockContentBoxHeading>
        <BlockContentBoxItem>
          {/* <PropsItem*/}
          {/* view="constructor-toggle"*/}
          {/* label="without type"*/}
          {/* setComponentButtonText="Set Component"*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="constructor-toggle"*/}
          {/* label="some very-very-very extremely long prop label"*/}
          {/* type="constructor"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* setComponentButtonText="Set Component"*/}
          {/* linkable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="constructor-toggle"*/}
          {/* label="disabled prop"*/}
          {/* type="constructor"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* setComponentButtonText="Set Component"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="constructor-toggle"*/}
          {/* label="disabled prop"*/}
          {/* type="constructor"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* image="http://www.funny-animalpictures.com/media/content/items/images/funnyowls0074_O.jpg"*/}
          {/* setComponentButtonText="Set Component"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* disabled*/}
          {/* />*/}
        </BlockContentBoxItem>

        <BlockContentBoxHeading>Prop View: toggle</BlockContentBoxHeading>
        <BlockContentBoxItem>
          {/* <PropsItem*/}
          {/* view="toggle"*/}
          {/* label="without type"*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="toggle"*/}
          {/* label="some very-very-very extremely long prop label"*/}
          {/* type="bool"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* linkable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="toggle"*/}
          {/* label="disabled prop"*/}
          {/* type="bool"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* linkable*/}
          {/* removable*/}
          {/* />*/}
          {/* <PropsItem*/}
          {/* view="toggle"*/}
          {/* label="disabled prop"*/}
          {/* type="bool"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* image="http://www.funny-animalpictures.com/media/content/items/images/funnyowls0074_O.jpg"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* disabled*/}
          {/* />*/}

          {/* <PropsItem*/}
          {/* view="toggle"*/}
          {/* label="has childrens - closed"*/}
          {/* type="bool"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* image="http://www.funny-animalpictures.com/media/content/items/images/funnyowls0074_O.jpg"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* >*/}
          {/* <PropsList>*/}
          {/* <PropsItem view="input" label="child item 1"/>*/}
          {/* <PropsItem view="input" label="child item 2"/>*/}
          {/* <PropsItem view="input" label="child item 3"/>*/}
          {/* </PropsList>*/}
          {/* </PropsItem>*/}

          {/* <PropsItem*/}
          {/* view="toggle"*/}
          {/* label="has childrens - opened"*/}
          {/* type="bool"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* image="http://www.funny-animalpictures.com/media/content/items/images/funnyowls0074_O.jpg"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* subtreeOn*/}
          {/* >*/}
          {/* <PropsList>*/}
          {/* <PropsItem view="input" label="child item 1"/>*/}
          {/* <PropsItem view="input" label="child item 2"/>*/}
          {/* <PropsItem view="input" label="child item 3"/>*/}
          {/* </PropsList>*/}
          {/* </PropsItem>*/}
        </BlockContentBoxItem>

        <BlockContentBoxHeading>Prop View: tree</BlockContentBoxHeading>
        <BlockContentBoxItem>
          {/* <PropsItem*/}
          {/* view="tree"*/}
          {/* label="without type"*/}
          {/* >*/}
          {/* <PropsList>*/}
          {/* <PropsItem view="input" label="child item 1" removable/>*/}
          {/* <PropsItem view="input" label="child item 2" removable/>*/}
          {/* <PropsItem view="input" label="child item 3" removable/>*/}
          {/* </PropsList>*/}
          {/* </PropsItem>*/}

          {/* <PropsItem*/}
          {/* view="tree"*/}
          {/* label="some very-very-very extremely long prop label"*/}
          {/* type="constructor"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* linkable*/}
          {/* >*/}
          {/* <PropsList>*/}
          {/* <PropsItem view="input" label="child item 1" removable/>*/}
          {/* <PropsItem view="input" label="child item 2" removable/>*/}
          {/* <PropsItem view="input" label="child item 3" removable/>*/}
          {/* </PropsList>*/}
          {/* </PropsItem>*/}

          {/* <PropsItem*/}
          {/* view="tree"*/}
          {/* label="disabled prop"*/}
          {/* type="constructor"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* linkable*/}
          {/* removable*/}
          {/* >*/}
          {/* <PropsList>*/}
          {/* <PropsItem view="input" label="child item 1" removable/>*/}
          {/* <PropsItem view="input" label="child item 2" removable/>*/}
          {/* <PropsItem view="input" label="child item 3" removable/>*/}
          {/* </PropsList>*/}
          {/* </PropsItem>*/}

          {/* <PropsItem*/}
          {/* view="tree"*/}
          {/* label="some very very very long prop label"*/}
          {/* type="constructor"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* image="http://www.funny-animalpictures.com/media/content/items/images/funnyowls0074_O.jpg"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* disabled*/}
          {/* >*/}
          {/* <PropsList>*/}
          {/* <PropsItem view="input" label="child item 1" removable/>*/}
          {/* <PropsItem view="input" label="child item 2" removable/>*/}
          {/* <PropsItem view="input" label="child item 3" removable/>*/}
          {/* </PropsList>*/}
          {/* </PropsItem>*/}

          {/* <PropsItem*/}
          {/* view="tree"*/}
          {/* label="has childrens - closed"*/}
          {/* type="object"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* image="http://www.funny-animalpictures.com/media/content/items/images/funnyowls0074_O.jpg"*/}
          {/* linkable*/}
          {/* removable*/}
          {/* >*/}
          {/* <PropsList>*/}
          {/* <PropsItem view="input" label="child item 1" removable/>*/}
          {/* <PropsItem view="input" label="child item 2" removable/>*/}
          {/* <PropsItem view="input" label="child item 3" removable/>*/}
          {/* </PropsList>*/}
          {/* </PropsItem>*/}

          {/* <PropsItem*/}
          {/* view="tree"*/}
          {/* label="Has childrens - opened"*/}
          {/* type="object"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* linkable*/}
          {/* opened*/}
          {/* >*/}
          {/* <PropsItem view="input" label="child item 1" removable/>*/}
          {/* <PropsItem view="input" label="child item 2" removable/>*/}
          {/* <PropsItem view="input" label="child item 3" removable/>*/}
          {/* </PropsItem>*/}

          {/* <PropsItem*/}
          {/* view="tree"*/}
          {/* label="Has childrens - opened"*/}
          {/* type="arrayOf"*/}
          {/* tooltip={'some tooltip'}*/}
          {/* linkable*/}
          {/* opened*/}
          {/* addNewField*/}
          {/* >*/}

          {/* <PropsItem view="input" label="child item 1" removable/>*/}
          {/* <PropsItem view="input" label="child item 2" removable/>*/}
          {/* <PropsItem view="input" label="child item 3" removable/>*/}

          {/* </PropsItem>*/}
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
          <ComponentActionsList items={componentActionsList}/>
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
      id: 'tool5',
      icon: 'cog',
      name: 'Parsers',
      title: 'Route Settings',
      undockable: true,
      closable: false,
      sections: toolComponentLayoutWindowSections,
      mainButtons: toolRouteWindowMainActions,
      secondaryButtons: toolRouteWindowSecondaryActions,
    }),

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

const headerMainMenu = [
  {
    text: 'Structure',
  },
  {
    text: 'Design',
  },
  {
    text: 'Data',
    isActive: true,
    submenuList: [
      {
        text: 'User Route: Route 1',
      },
      {
        text: 'User Route: Route 2',
      },
    ],
  },
  {
    text: 'Settings',
  },
];
const headerMenuSecondary = [
  {
    text: 'Preview',
  },
  {
    text: 'Publish',
  },
];
const footerMenuRight = [
  {
    text: "Show component's title",
    subcomponentRight: '<ToggleButton />',
  },
  {
    text: 'Show placeholders',
    subcomponentRight: '<ToggleButton />',
  },
  {
    text: 'Toggle fullscreen',
  },
];

const breadcrumbsItems = [
  {
    title: 'ParentComponent',
  },
  {
    title: 'Content',
    isActive: true,
  },
];

export default class Playground extends React.Component {
  render() {
    return (
      <App fixed>
        <TopRegion fixed={false}>
          <Header size="blank">
            <HeaderRegion size="blank">
              <HeaderLogoBox title="Project X"/>
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
                        <HeaderMenuItem text="Data" isActive={true}/>
                        <HeaderMenuItem text="Settings" />
                      </HeaderMenuList>
                  </HeaderMenuGroup>
                </HeaderMenu>
              </HeaderMenu>
            </HeaderRegion>

            <HeaderRegion size="blank">
              <ProjectSave status="error"/>
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

            <HeaderRoute />

            <PanelContent>
              <DataWindow />
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
                    <FooterMenuItem text="Show component's title" subcomponentRight={<ToggleButton />}/>
                    <FooterMenuItem text="Show placeholders" subcomponentRight={<ToggleButton />}/>
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
