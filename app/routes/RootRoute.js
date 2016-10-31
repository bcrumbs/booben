/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router';

import {
    getRoutes,
    getLocalizedText
} from '../utils';

import {
    App,
    TopRegion,
    BottomRegion,
    Header,
    HeaderRegion,
    HeaderLogoBox,
    HeaderMenu,
    HeaderMenuGroup,
    HeaderMenuList,
    HeaderMenuItem,
    Footer,
    FooterRegion,
    FooterMenu,
    FooterMenuGroup,
    FooterMenuList,
    FooterMenuItem,
    ToggleButton
} from '@reactackle/reactackle';

import { ComponentsDragArea } from '../containers/ComponentsDragArea/ComponentsDragArea';

import ProjectRecord from '../models/Project';

const TopMenuLink = props =>
    <Link to={props.href} className={props.className}>
        {props.children}
    </Link>;

const toggleFullscreen = () => {
    if (!document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
    ) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
        else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        }
        else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
    else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
};

const RootRoute = props => {
    const routeMenuItems = getRoutes(props.projectData.routes).map(route => (
        <HeaderMenuItem
            key={route.id}
            text={route.path}
            linkHref={`/${props.projectName}/design/${route.id}`}
            linkComponent={TopMenuLink}
        />
    ));
    const { getLocalizedText } = props;
    return (
        <App fixed>
            <TopRegion fixed={false}>
                <Header size="blank">
                    <HeaderRegion size='blank'>
                        <HeaderLogoBox title={ getLocalizedText('projectTitle', { projectName: props.projectName}) }/>
                    </HeaderRegion>

                    <HeaderRegion region="main" size='blank'>
                        <HeaderMenu inline dense mode="light">
                            <HeaderMenuGroup>
                                <HeaderMenuList>
                                    <HeaderMenuItem
                                        text={ getLocalizedText('structure') }
                                        linkHref={`/${props.projectName}/structure`}
                                        linkComponent={TopMenuLink}
                                    />

                                    <HeaderMenuItem text={ getLocalizedText('design') }>
                                        <HeaderMenuGroup mode="dark">
                                            <HeaderMenuList>
                                                {routeMenuItems}
                                            </HeaderMenuList>
                                        </HeaderMenuGroup>
                                    </HeaderMenuItem>

                                    <HeaderMenuItem text={ getLocalizedText('data') } />
                                    <HeaderMenuItem text={ getLocalizedText('settings') } />
                                </HeaderMenuList>
                            </HeaderMenuGroup>
                        </HeaderMenu>
                    </HeaderRegion>

                    <HeaderRegion size="blank">
                        <HeaderMenu inline dense mode="light">
                            <HeaderMenuGroup>
                                <HeaderMenuList>
                                    <HeaderMenuItem
                                        text={ getLocalizedText('preview') }
                                        linkHref={`/${props.projectName}/preview`}
                                        linkComponent={TopMenuLink}
                                    />
                                    <HeaderMenuItem text={ getLocalizedText('publish') } />
                                </HeaderMenuList>
                            </HeaderMenuGroup>
                        </HeaderMenu>
                    </HeaderRegion>
                </Header>
            </TopRegion>

            {props.children}

            <BottomRegion>
                <Footer>
                    <FooterRegion region="main" size='blank'>
                        <FooterMenu inline dense mode="light">
                            <FooterMenuGroup>
                                <FooterMenuList>
                                    <FooterMenuItem text={ getLocalizedText('faq') }/>
                                </FooterMenuList>
                            </FooterMenuGroup>
                        </FooterMenu>
                    </FooterRegion>

                    <FooterRegion size='blank'>
                        <FooterMenu inline dense mode="light">
                            <FooterMenuGroup>
                                <FooterMenuList>
                                    <FooterMenuItem
                                        text={ getLocalizedText('showComponentsTitle') }
                                        subcomponentRight={<ToggleButton />}
                                    />

                                    <FooterMenuItem
                                        text={ getLocalizedText('showPlaceholders') }
                                        subcomponentRight={<ToggleButton />}
                                    />

                                    <FooterMenuItem
                                        text={ getLocalizedText('toggleFullScreen') }
                                        onClick={toggleFullscreen}
                                    />
                                </FooterMenuList>
                            </FooterMenuGroup>
                        </FooterMenu>
                    </FooterRegion>
                </Footer>
            </BottomRegion>

            <ComponentsDragArea/>
        </App>
    )
};

RootRoute.propTypes = {
    projectName: PropTypes.string,
    projectData: PropTypes.instanceOf(ProjectRecord)
};

RootRoute.displayName = 'RootRoute';

const mapStateToProps = ({ project: { projectName, data: projectData }, app: { language, localization }}) => ({
    projectName,
    projectData,
    getLocalizedText(...args) { return getLocalizedText(localization, language, ...args) }
});

export default connect(mapStateToProps)(RootRoute);
