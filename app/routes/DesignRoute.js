/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Desktop } from '../containers/Desktop/Desktop';
import { ComponentsLibrary } from '../containers/ComponentsLibrary/ComponentsLibrary';
import { ComponentsTreeView } from '../containers/ComponentsTreeView/ComponentsTreeView';
import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';

import store from '../store';
import { findRouteById } from '../utils';

import ProjectRecord from '../models/Project';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';

import { List } from 'immutable';

const libraryTool = new ToolRecord({
    id: 'componentsLibrary',
    icon: 'cubes',
    name: 'Components Library',
    title: 'Components Library',
    sections: List([
        new ToolSectionRecord({
            name: '',
            component: ComponentsLibrary
        })
    ]),
    windowMinWidth: 360
});

class DesignRoute extends Component {
    render() {
        const src = `/preview/${this.props.params.projectName}/index.html`,
            routeId = parseInt(this.props.params.routeId),
            isIndexRoute = this.props.location.pathname.endsWith('/index'),
            route = findRouteById(this.props.project.routes, routeId);

        // TODO: Show error screen
        if (!route) return null;

        const rootComponent = isIndexRoute ? route.indexComponent : route.component;

        const treeTool = new ToolRecord({
            id: 'componentsTree',
            icon: 'sitemap',
            name: 'Elements tree',
            title: 'Elements tree',
            sections: List([
                new ToolSectionRecord({
                    name: '',
                    component: () => (
                        <ComponentsTreeView rootComponent={rootComponent} />
                    )
                })
            ])
        });

        const toolGroups = List([List([libraryTool, treeTool])]);

        return (
            <Desktop toolGroups={toolGroups}>
                <PreviewIFrame
                    interactive
                    store={store}
                    url={src}
                    path={route.fullPath}
                    isIndexRoute={isIndexRoute}
                />
            </Desktop>
        );
    }
}

DesignRoute.propTypes = {
    project: PropTypes.instanceOf(ProjectRecord)
};

const mapStateToProps = state => ({
    project: state.project.data
});

export default connect(
    mapStateToProps
)(DesignRoute);
