/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

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

import {
    toggleContentPlaceholders,
    toggleComponentTitles
} from '../actions/app';

import { getLocalizedText } from '../utils';

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
    const { getLocalizedText } = props,
        routeMenuItems = [],
        currentPath = props.location.pathname;

    props.project.routes.forEach(route => {
        const href = `/${props.projectName}/design/${route.id}`;

        routeMenuItems.push(
            <HeaderMenuItem
                key={route.id}
                text={route.fullPath}
                linkHref={href}
                linkComponent={TopMenuLink}
                isActive={href === currentPath}
            />
        );

        if (route.haveIndex) {
            const indexHref = `/${props.projectName}/design/${route.id}/index`;

            routeMenuItems.push(
                <HeaderMenuItem
                    key={`${route.id}-index`}
                    text={`${route.fullPath} - index`}
                    linkHref={indexHref}
                    linkComponent={TopMenuLink}
                    isActive={indexHref === currentPath}
                />
            );
        }
    });

    const title = getLocalizedText('projectTitle', { projectName: props.projectName });

    return (
        <App fixed>
            <TopRegion fixed={false}>
                <Header size="blank">
                    <HeaderRegion size='blank'>
                        <HeaderLogoBox title={title} />
                    </HeaderRegion>

                    <HeaderRegion spread size='blank'>
                        <HeaderMenu inline dense mode="light">
                            <HeaderMenuGroup>
                                <HeaderMenuList>
                                    <HeaderMenuItem
                                        text={getLocalizedText('structure')}
                                        linkHref={`/${props.projectName}/structure`}
                                        linkComponent={TopMenuLink}
                                    />

                                    <HeaderMenuItem text={getLocalizedText('design')}>
                                        <HeaderMenuGroup mode="dark">
                                            <HeaderMenuList>
                                                {routeMenuItems}
                                            </HeaderMenuList>
                                        </HeaderMenuGroup>
                                    </HeaderMenuItem>

                                    <HeaderMenuItem text={getLocalizedText('data')} />
                                    <HeaderMenuItem text={getLocalizedText('settings')} />
                                </HeaderMenuList>
                            </HeaderMenuGroup>
                        </HeaderMenu>
                    </HeaderRegion>

                    <HeaderRegion size="blank">
                        <HeaderMenu inline dense mode="light">
                            <HeaderMenuGroup>
                                <HeaderMenuList>
                                    <HeaderMenuItem
                                        text={getLocalizedText('preview')}
                                        linkHref={`/${props.projectName}/preview`}
                                        linkComponent={TopMenuLink}
                                    />
                                    <HeaderMenuItem text={getLocalizedText('publish')} />
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
                                    <FooterMenuItem text={getLocalizedText('faq')}/>
                                </FooterMenuList>
                            </FooterMenuGroup>
                        </FooterMenu>
                    </FooterRegion>

                    <FooterRegion size='blank'>
                        <FooterMenu inline dense mode="light">
                            <FooterMenuGroup>
                                <FooterMenuList>
                                    <FooterMenuItem
                                        text={getLocalizedText('showComponentsTitle')}
                                        subcomponentRight={
                                            <ToggleButton
                                                checked={props.showComponentTitles}
                                                onCheck={props.onToggleComponentTitles}
                                            />
                                        }
                                    />

                                    <FooterMenuItem
                                        text={getLocalizedText('showPlaceholders')}
                                        subcomponentRight={
                                            <ToggleButton
                                                checked={props.showContentPlaceholders}
                                                onCheck={props.onToggleContentPlaceholders}
                                            />
                                        }
                                    />

                                    <FooterMenuItem
                                        text={getLocalizedText('toggleFullScreen')}
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
    );
};

RootRoute.propTypes = {
    projectName: PropTypes.string,
    project: PropTypes.instanceOf(ProjectRecord),
    showContentPlaceholders: PropTypes.bool,
    showComponentTitles: PropTypes.bool,
    getLocalizedText: PropTypes.func,

    onToggleContentPlaceholders: PropTypes.func,
    onToggleComponentTitles: PropTypes.func
};

RootRoute.displayName = 'RootRoute';

const mapStateToProps = ({ project, app }) => ({
    projectName: project.projectName,
    project: project.data,
    showContentPlaceholders: app.showContentPlaceholders,
    showComponentTitles: app.showComponentTitles,
    getLocalizedText: (...args) => getLocalizedText(
        app.localization,
        app.language,
        ...args
    )
});

const mapDispatchToProps = dispatch => ({
    onToggleContentPlaceholders: enable =>
        void dispatch(toggleContentPlaceholders(enable)),

    onToggleComponentTitles: enable =>
        void dispatch(toggleComponentTitles(enable))
});

export default connect(mapStateToProps, mapDispatchToProps)(RootRoute);
