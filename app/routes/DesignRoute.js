/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Desktop } from '../containers/Desktop/Desktop';
import { ComponentsLibrary } from '../containers/ComponentsLibrary/ComponentsLibrary';
import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';

import store from '../store';
import { getRoutes } from '../utils';

import ProjectRecord from '../models/Project';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';

import { List } from 'immutable';

const toolGroups = List([
    List([
        new ToolRecord({
            id: 'componentsLibrary',
            icon: 'cubes',
            name: 'Components Library',
            title: 'Components Library',
            undockable: true,
            closable: false,
            sections: List([
                new ToolSectionRecord({
                    name: '',
                    component: ComponentsLibrary
                })
            ]),
            mainButtons: List(),
            secondaryButtons: List(),
            windowMinWidth: 360
        })
    ])
]);

class DesignRoute extends Component {
    render() {
        const src = `/preview/${this.props.params.projectName}/index.html`,
            routeId = parseInt(this.props.params.routeId),
            isIndexRoute = this.props.location.pathname.endsWith('/index');

        const route = getRoutes(this.props.project.routes)
            .find(route => route.id === routeId);

        return (
            <Desktop toolGroups={toolGroups}>
                <PreviewIFrame
                    interactive
                    store={store}
                    url={src}
                    path={route.path}
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
