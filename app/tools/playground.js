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
						<PropsItem type="toggle" linkable label="Redirect" checked/>
						<PropsItem type="input" linkable label="Set URL"/>
					</PropsList>
				</BlockContentBoxItem>

				<BlockContentBoxHeading>If redirect is off</BlockContentBoxHeading>
				<BlockContentBoxItem>
					<PropsList>
						<PropsItem type="toggle" linkable label="Redirect"/>
					</PropsList>
				</BlockContentBoxItem>

				{/*<BlockContentBoxHeading>Props Group 2</BlockContentBoxHeading>*/}
				{/*<BlockContentBoxItem>*/}
					{/*<PropsList>*/}
						{/*<PropsItem type="array" label="Array Prop" />*/}
					{/*</PropsList>*/}
				{/*</BlockContentBoxItem>*/}
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
																<ComponentsTreeItem title="Another extremely long tree item item item item item item" showSublevel hasTooltip>
																	<ComponentsTreeList>
																		<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																			<ComponentsTreeList>
																				<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																					<ComponentsTreeList>
																						<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																							<ComponentsTreeList>
																								<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																									<ComponentsTreeList>
																										<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																											<ComponentsTreeList>
																												<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																													<ComponentsTreeList>
																														<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																															<ComponentsTreeList>
																																<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																																	<ComponentsTreeList>
																																		<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																																			<ComponentsTreeList>
																																				<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																																					<ComponentsTreeList>
																																						<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																																							<ComponentsTreeList>
																																								<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																																									<ComponentsTreeList>
																																										<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																																											<ComponentsTreeList>
																																												<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																																													<ComponentsTreeList>
																																														<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
																																															<ComponentsTreeList>
																																																<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip />
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
							</ComponentsTreeList>
						</ComponentsTreeItem>
						<ComponentsTreeItem title="routeB">
							<ComponentsTreeList>
								<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
									<ComponentsTreeList>
										<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
											<ComponentsTreeList>
												<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip>
													<ComponentsTreeList>
														<ComponentsTreeItem title="Components Tree List" showSublevel hasTooltip />
													</ComponentsTreeList>
												</ComponentsTreeItem>
											</ComponentsTreeList>
										</ComponentsTreeItem>
									</ComponentsTreeList>
								</ComponentsTreeItem>
							</ComponentsTreeList>
						</ComponentsTreeItem>
						<ComponentsTreeItem title="routeC">
							<ComponentsTreeList>
							</ComponentsTreeList>
						</ComponentsTreeItem>
					</ComponentsTree>

			</BlockContentBox>
		)
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
 