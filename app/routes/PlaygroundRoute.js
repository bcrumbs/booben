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

import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';

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

                <Desktop toolGroups={toolGroups} />

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
