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
	FooterMenuItem
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

import {
	DraggableWindow,
	DraggableWindowRegion
} from './DraggableWindow/DraggableWindow';

const titleButtons = [
	{
		icon: 'compress'
	},
	{
		icon: 'times'
	}
];
const titleButtons2 = [
	{
		icon: 'times'
	},
	{
		icon: 'caret-down'
	}
];

const drawerButtons = [
	{
		icon: 'arrows-alt'
	},
	{
		icon: 'chevron-right'
	}
];

export default class Test extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showText2: false
        };

        this._handleClick = this._handleClick.bind(this);
    }

    _handleClick() {
        this.setState({
            showText2: !this.state.showText2
        })
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
				        <Panel headerFixed={true} maxHeight="initial">
					        <Header>
						        <HeaderRegion alignY="center">
							        <HeaderTitle>Route Title: Data</HeaderTitle>
						        </HeaderRegion>

						        <HeaderRegion region="main" size='blank'>
							        <Tabs colorMode="light">
								        <Tab text="Scheme"/>
								        <Tab text="Functions"/>
								        <Tab text="Mutations"/>
							        </Tabs>
						        </HeaderRegion>
					        </Header>

					        <PanelContent>

						        <Row>
							        <h1>Обычный дропдаун</h1>
						        </Row>

						        <Row>
							        <DraggableWindow>
								        <DraggableWindowRegion>
									        <BlockContent>

										        <BlockContentTitle isEditable={true} buttons={titleButtons} title="Editable Title" subtitle="DraggableWindow238" iconLeft="ellipsis-v"/>

										        <BlockContentNavigation>
											        <Tabs colorMode="dark">
												        <Tab text="Tab 1" />
												        <Tab text="Tab 2" />
												        <Tab text="Tab 3" />
											        </Tabs>
										        </BlockContentNavigation>

										        <BlockContentBox>
											        <BlockContentBoxHeading>Header 1</BlockContentBoxHeading>
											        <BlockContentBoxItem>
												        Content block 1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
											        </BlockContentBoxItem>
											        <BlockContentBoxItem>
												        Content block 2. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
											        </BlockContentBoxItem>

											        <BlockContentBoxHeading>Header 2</BlockContentBoxHeading>
											        <BlockContentBoxItem>
												        Content block 3. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
											        </BlockContentBoxItem>
											        <BlockContentBoxItem blank={true}>
												        Content block 4 - blank. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
											        </BlockContentBoxItem>
										        </BlockContentBox>

										        <BlockContentActions>
											        <BlockContentActionsRegion>
												        <Button icon='trash-o'/>
											        </BlockContentActionsRegion>

											        <BlockContentActionsRegion type="main">
												        <Button text="Edit content" />
												        <Button text="Save" />
											        </BlockContentActionsRegion>
										        </BlockContentActions>

									        </BlockContent>

								        </DraggableWindowRegion>

								        <DraggableWindowRegion type="aside">
									        <BlockContentBox>
										        <BlockContentBoxItem>
											        Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,
										        </BlockContentBoxItem>
									        </BlockContentBox>

									        <BlockContentActions>
										        <BlockContentActionsRegion>
											        <Button text="Cancel" />
											        <Button text="Save" />
										        </BlockContentActionsRegion>
									        </BlockContentActions>
								        </DraggableWindowRegion>
							        </DraggableWindow>
						        </Row>
					        </PanelContent>
				        </Panel>
			        </Content>
			        <PageDrawer isExpanded={false}>
				        <PageDrawerActionsArea>
					        <PageDrawerActionsGroup>
						        <PageDrawerActionItem icon='cube' title="Component Props" isActive={true} />
						        <PageDrawerActionItem icon='file-text-o' title="Data"/>
						        <PageDrawerActionItem icon='sitemap' title="Elements Tree"/>
						        <PageDrawerActionPlaceholder />
					        </PageDrawerActionsGroup>
				        </PageDrawerActionsArea>

				        <PageDrawerContentArea>
					        <BlockContent>
						        {/*1. Empty State*/}
						        {/*<BlockContentTitle isEditable={false} buttons={[{icon: 'chevron-right'}]}/>*/}
						        {/*<BlockContentPlaceholder text="I'm so empty content block :( First choose some component to see its props." />*/}

						        {/*2. Has content*/}
						        <BlockContentTitle isEditable={true} title="Drawer content title"  buttons={drawerButtons}/>

						        <BlockContentBox>
							        <BlockContentBoxHeading>Header 1</BlockContentBoxHeading>
							        <BlockContentBoxItem>
								        Content block 1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
							        </BlockContentBoxItem>
							        <BlockContentBoxItem>
								        Content block 2. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
							        </BlockContentBoxItem>
						        </BlockContentBox>

						        <BlockContentActions>
							        <BlockContentActionsRegion>
								        <Button icon='trash-o'/>
							        </BlockContentActionsRegion>

							        <BlockContentActionsRegion type="main">
								        <Button text="Edit content" />
								        <Button text="Save" />
							        </BlockContentActionsRegion>
						        </BlockContentActions>
					        </BlockContent>
				        </PageDrawerContentArea>

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
						        <FooterMenuItem text="Show component's title"/>
						        <FooterMenuItem text="Show placeholders"/>
						        <FooterMenuItem text="Toggle Full Screen"/>
					        </FooterMenu>
				        </FooterRegion>
			        </Footer>
		        </BottomRegion>
	        </App>
        );
    }
}
