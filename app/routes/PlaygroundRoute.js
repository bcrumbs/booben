/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

import {
    App,
    TopRegion,
    BottomRegion,
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
	MenuGroup,
    HeaderMenuItem,
    Footer,
    FooterRegion,
    FooterMenu,
    FooterMenuItem,
	Panel,
	PanelContent,
	Row,
	Tabs,
	Tab,
    ToggleButton
} from '@reactackle/reactackle';

import {
	RoutesList,
	RouteCard,
	RouteNewButton
} from '../components/RoutesList/RoutesList';

import {
	LayoutSelection,
	LayoutSelectionItem
} from '../components/LayoutSelection/LayoutSelection';

import { Desktop } from '../containers/Desktop/Desktop';

import toolGroups from '../tools/playground';

const headerMainMenu = [
	{
		text: "Structure"
	},
	{
		text: "Design"
	},
	{
		text: "Data",
		isActive: true,
		submenuList: [
			{
				text: "User Route: Route 1"
			},
			{
				text: "User Route: Route 2"
			}
		]
	},
	{
		text: "Settings"
	}
];
const headerMenuSecondary = [
	{
		text: "Preview"
	},
	{
		text: "Publish"
	}
];
const footerMenuRight = [
	{
		text: "Show component's title",
		subcomponentRight: '<ToggleButton />'
	},
	{
		text: "Show placeholders",
		subcomponentRight: '<ToggleButton />'
	},
	{
		text: "Toggle fullscreen"
	}
];

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
	                            <MenuGroup data={headerMainMenu} />
                            </HeaderMenu>
                        </HeaderRegion>

                        <HeaderRegion size='blank'>
	                        <HeaderMenu inline={true}  dense={true}>
		                        <MenuGroup data={headerMenuSecondary} />
	                        </HeaderMenu>
                        </HeaderRegion>
                    </Header>
                </TopRegion>

                <Desktop toolGroups={toolGroups}>
	                <Panel headerFixed={true} maxHeight="initial">

		                <PanelContent>
			                <Container>
				                <Row>
					                {/*<LayoutSelection>*/}
						                {/*<LayoutSelectionItem image="http://img11.nnm.me/d/3/5/5/b/4d572a2fdc5b8c28cad40d9ca45.jpg" title="Empty Template" />*/}
						                {/*<LayoutSelectionItem image="http://cdn.pcwallart.com/images/cosmos-hd-wallpaper-3.jpg" title="Template A" subtitle="Header, Footer, Sidebar" />*/}
						                {/*<LayoutSelectionItem image="http://coolvibe.com/wp-content/uploads/2010/06/cosmos.jpg" title="Template B" subtitle="Header" active />*/}
						                {/*<LayoutSelectionItem image="http://s9.favim.com/orig/130808/cosmos-space-Favim.com-838531.jpg" title="Template C" />*/}
						                {/*<LayoutSelectionItem image="http://news.nationalgeographic.com/news/2009/07/photogalleries/week-in-space-pictures-50/images/primary/090707-01-omega-nebula_big.jpg" title="Template D" />*/}
						                {/*<LayoutSelectionItem image="http://www.hotel-r.net/im/hotel/fr/cosmos-12.jpg" title="Template E" />*/}
						                {/*<LayoutSelectionItem image="http://www.xtec.cat/~vmessegu/img/milkyway.jpg" title="Template F" />*/}
						                {/*<LayoutSelectionItem image="https://pursuingveritasdotcom.files.wordpress.com/2015/03/cosmos.jpg" title="Template G" />*/}
						                {/*<LayoutSelectionItem image="http://media.salon.com/2013/10/shutterstock_136444319.jpg" title="Template H" />*/}
					                {/*</LayoutSelection>*/}
				                </Row>

				                <Row>
					                <Column>
						                <RoutesList>
							                <RouteCard title="Root" subtitle="/" redirect>
								                <RoutesList>
									                <RouteCard title="Index"  index/>
									                <RouteCard title="Parsers" subtitle="parsers" >
										                <RoutesList>
										                    <RouteCard title="Route 1" subtitle="route1" focused >
											                    <RoutesList>
												                    <RouteCard title="Route 2" subtitle="route2" />
												                    <RouteCard title="Route 3" subtitle="route3">
													                    <RoutesList>
														                    <RouteCard title="Index" index/>
														                    <RouteCard title="Route 4" subtitle="route4" />

														                    {/*<ComponentBreadcrumbs>*/}
																				{/*<ComponentBreadcrumbItem placeholder />*/}
															                    {/*<ComponentBreadcrumbItem text="Routes List"/>*/}
															                    {/*<ComponentBreadcrumbItem separator />*/}
																				{/*<ComponentBreadcrumbItem text="Route Card" disabled />*/}
																				{/*<ComponentBreadcrumbItem separator />*/}
																				{/*<ComponentBreadcrumbItem text="Routes List" />*/}
														                    {/*</ComponentBreadcrumbs>*/}

													                    </RoutesList>
												                    </RouteCard>
												                    <RouteNewButton text="New Route" />
											                    </RoutesList>
										                    </RouteCard>
									                    </RoutesList>
									                </RouteCard>
									                <RouteCard title="Parser" subtitle="parser-{parser.ParserTitle}" />
								                </RoutesList>
							                </RouteCard>
							                <RouteNewButton text="New Root"  />
						                </RoutesList>
					                </Column>
				                </Row>
			                </Container>
		                </PanelContent>
	                </Panel>
                </Desktop>

                <BottomRegion fixed={false}>
                    <Footer>
                        <FooterRegion region="main" size='blank'>
                            <FooterMenu inline={true}  dense={true}>
                                <FooterMenuItem text="FAQ"/>
                            </FooterMenu>
                        </FooterRegion>
                        <FooterRegion size='blank'>
                            <FooterMenu inline={true}  dense={true}>
	                            <MenuGroup data={footerMenuRight} />
                            </FooterMenu>
                        </FooterRegion>
                    </Footer>
                </BottomRegion>
            </App>
        );
    }
}
