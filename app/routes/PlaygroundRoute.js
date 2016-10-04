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
    Header,
    HeaderRegion,
	HeaderTitle,
    HeaderLogoBox,
    HeaderMenu,
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
	ComponentBreadcrumbs,
	ComponentBreadcrumbItem
} from '../components/ComponentBreacrumbs/ComponentBreadcrumbs';

import { Desktop } from '../containers/Desktop/Desktop';

import toolGroups from '../tools/playground';

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

                <Desktop toolGroups={toolGroups}>
	                <Panel headerFixed={true} maxHeight="initial">

		                <PanelContent>
			                <Container>
				                <Row>
					                <Column>
						                <RoutesList>
							                <RouteCard title="Root">
								                <RoutesList>
									                <RouteCard title="Index" subtitle="/" home />
									                <RouteCard title="Parsers" subtitle="parsers" >
										                <RoutesList>
										                    <RouteCard title="Route 1" subtitle="route1" focused>
											                    <RoutesList>
												                    <RouteCard title="Route 2" subtitle="route2" />
												                    <RouteCard title="Route 3" subtitle="route3">
													                    <RoutesList>
														                    <RouteCard title="Route 4" subtitle="route4" />

														                    <ComponentBreadcrumbs>
																				<ComponentBreadcrumbItem placeholder/>
															                    <ComponentBreadcrumbItem text="Routes List"/>
															                    <ComponentBreadcrumbItem separator/>
																				<ComponentBreadcrumbItem text="Route Card" disabled/>
																				<ComponentBreadcrumbItem separator/>
																				<ComponentBreadcrumbItem text="Routes List" />
														                    </ComponentBreadcrumbs>

													                    </RoutesList>
												                    </RouteCard>
												                    <RouteNewButton />
											                    </RoutesList>
										                    </RouteCard>
									                    </RoutesList>
									                </RouteCard>
									                <RouteCard title="Parser" subtitle="parser-{parser.ParserTitle}" />
								                </RoutesList>
							                </RouteCard>
							                <RouteNewButton />
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
