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
	ComponentsTree,
	ComponentsTreeList,
	ComponentsTreeItem
} from '../components/ComponentsTree/ComponentsTree';

import {
	PropsList,
	PropsItem
} from '../components/PropsList/PropsList';

import {
	ComponentLayoutSelection,
	ComponentLayoutSelectionItem
} from '../components/ComponentLayoutSelection/ComponentLayoutSelection';

import { List, Set } from 'immutable';

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
const accordionItems = List([
    new AccordionItemRecord({
        id: 'tab1',
        title: 'Form',
        content: 'some accordion item'
    }),

    new AccordionItemRecord({
        id: 'tab2',
        title: "Text",
        content: 'some accordion item'
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
        )
    })
]);

const toolComponentsWindowSections = List([
	new ToolSectionRecord({
		name: 'Section 1',
		component: () => (
            <BlockContentBox>
                <Accordion single items={accordionItems} expandedItemIds={Set(['tab3'])}/>
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

// Route Editing
const toolRouteWindowSections = List([
	new ToolSectionRecord({
		name: 'Route Editing',
		component: () => (
			<BlockContentBox>
				<BlockContentBoxHeading>If redirect is on</BlockContentBoxHeading>
				<BlockContentBoxItem>
					<PropsList>
						<PropsItem type="tree" />
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
		)
	})
]);

// Component Props : Step 1 - template
const toolComponentTemplatesWindowSections = List([
	new ToolSectionRecord({
		name: 'Route Editing',
		component: () => (
			<BlockContentBox>
				<BlockContentBoxHeading>Component Templates</BlockContentBoxHeading>
				<BlockContentBoxItem>
					<ComponentLayoutSelection>
						<ComponentLayoutSelectionItem image={'http://img11.nnm.me/d/3/5/5/b/4d572a2fdc5b8c28cad40d9ca45.jpg'} title={'single block'} />
						<ComponentLayoutSelectionItem image={"http://cdn.pcwallart.com/images/cosmos-hd-wallpaper-3.jpg"} title={'2 equal parts'} />
						<ComponentLayoutSelectionItem image={"http://coolvibe.com/wp-content/uploads/2010/06/cosmos.jpg"} title={'3 equal parts'} />
						<ComponentLayoutSelectionItem image={"http://coolvibe.com/wp-content/uploads/2010/06/cosmos.jpg"} title={'2 equal parts, 1 full-height'} />
					</ComponentLayoutSelection>
				</BlockContentBoxItem>
			</BlockContentBox>
		)
	})
]);

// Component Props : Step 2 - layout
const toolComponentLayoutWindowSections = List([
	new ToolSectionRecord({
		name: 'Route Editing',
		component: () => (
			<BlockContentBox>
				<BlockContentBoxHeading>Component Templates</BlockContentBoxHeading>
				<BlockContentBoxItem>
					<ComponentLayoutSelection>
						<ComponentLayoutSelectionItem image={'http://img11.nnm.me/d/3/5/5/b/4d572a2fdc5b8c28cad40d9ca45.jpg'} title={'single block'} />
						<ComponentLayoutSelectionItem image={"http://cdn.pcwallart.com/images/cosmos-hd-wallpaper-3.jpg"} title={'2 equal parts'} />
						<ComponentLayoutSelectionItem image={"http://coolvibe.com/wp-content/uploads/2010/06/cosmos.jpg"} title={'3 equal parts'} />
						<ComponentLayoutSelectionItem image={"http://coolvibe.com/wp-content/uploads/2010/06/cosmos.jpg"} title={'2 equal parts, 1 full-height'} />
					</ComponentLayoutSelection>
				</BlockContentBoxItem>
			</BlockContentBox>
		)
	})
]);

// const toolComponentTemplatesMainActions = List([
// 	new ButtonRecord({
// 		text: 'Save',
// 		onPress: () => {}
// 	})
// ]);
//
// const toolComponentTemplatesSecondaryActions = List([
// 	new ButtonRecord({
// 		icon: 'trash-o',
// 		onPress: () => {}
// 	})
// ]);

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
		    id: 'tool7',
		    icon: 'cog',
		    name: 'Component Settings',
		    title: 'Component Settings',
		    undockable: true,
		    closable: false,
		    sections: toolComponentTemplatesWindowSections,
		    mainButtons: '',
		    secondaryButtons: ''
	    }),

	    new ToolRecord({
		    id: 'tool6',
		    icon: 'sitemap',
		    name: 'Elements Tree',
		    title: 'Elements Tree',
		    undockable: true,
		    closable: false,
		    sections: toolSitemapWindowSections
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
        })
    ])
]);
 