/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router';

import {
    NOT_LOADED,
    LOADING,
    LOAD_ERROR
} from '../constants/loadStates';

import {
    getRoutes
} from '../utils';

import {
    App,
    TopRegion,
    MainRegion,
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

const TopMenuLink = props =>
    <Link to={props.href} className={props.className}>
        {props.children}
    </Link>;

const toggleFullScreen = () => {
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

class RootRoute extends Component {
    _getDesignMenu(projectData) {
        if(projectData) {
            return getRoutes(projectData.routes).map((route) => {
                return <HeaderMenuItem
                    text={route.path}
                    linkHref={`/app/${this.props.projectName}/design/${route.id}`}
                />
            });
        }
        return [];
    }

    render() {
        const loadState = this.props.projectLoadState;

        // TODO: Create loading screen
        if (loadState === LOADING || loadState === NOT_LOADED)
            return <div>Loading project...</div>;

        // TODO: Create error screen
        if (loadState === LOAD_ERROR)
            return <div>Failed to load project: {this.props.projectLoadError.message}</div>;

        return (
            <App fixed>
                <TopRegion>
                    <Header size="blank">
                        <HeaderRegion size='blank'>
                            <HeaderLogoBox title={this.props.projectName}/>
                        </HeaderRegion>

                        <HeaderRegion region="main" size='blank'>
                            <HeaderMenu inline dense>
                                <HeaderMenuItem
                                    text="Structure"
                                    linkHref={`/${this.props.projectName}/structure`}
                                    linkComponent={TopMenuLink}
                                />

                                <HeaderMenuItem text="Design">
                                    {this._getDesignMenu(this.props.projectData)}
                                </HeaderMenuItem>
                                <HeaderMenuItem text="Data" />
                                <HeaderMenuItem text="Settings" />

                            </HeaderMenu>
                        </HeaderRegion>

                        <HeaderRegion size="blank">
                            <HeaderMenu inline dense>
                                <HeaderMenuItem
                                    text="Preview"
                                    linkHref={`/${this.props.projectName}/preview`}
                                    linkComponent={TopMenuLink}
                                />
                                <HeaderMenuItem text="Publish" />
                            </HeaderMenu>
                        </HeaderRegion>
                    </Header>
                </TopRegion>

                {this.props.children}

                <BottomRegion>
                    <Footer>
                        <FooterRegion region="main" size='blank'>
                            <FooterMenu inline dense>
                                <FooterMenuItem text="FAQ"/>
                            </FooterMenu>
                        </FooterRegion>
                        <FooterRegion size='blank'>
                            <FooterMenu inline dense>
                                <FooterMenuItem
                                    text="Show component's title"
                                    subcomponentRight={<ToggleButton />}
                                />

                                <FooterMenuItem
                                    text="Show placeholders"
                                    subcomponentRight={<ToggleButton />}
                                />

                                <FooterMenuItem
                                    text="Toggle Full Screen"
                                />
                            </FooterMenu>
                        </FooterRegion>
                    </Footer>
                </BottomRegion>
            </App>
        )
    }
}

RootRoute.propTypes = {
    projectName: PropTypes.string,
    projectLoadState: PropTypes.number,
    projectLoadError: PropTypes.object,
    onProjectRequest: PropTypes.func,
    projectData: PropTypes.object
};

RootRoute.displayName = 'RootRoute';

const mapStateToProps = state => ({
    projectName: state.project.projectName,
    projectLoadState: state.project.loadState,
    projectLoadError: state.project.error,
    projectData: state.project.data
});

export default connect(
    mapStateToProps
)(RootRoute);
