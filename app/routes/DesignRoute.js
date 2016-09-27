/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Desktop } from '../containers/Desktop/Desktop';
import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';
import store from '../store';

import {
    getRoutes
} from '../utils';

import toolGroups from '../tools/design';

import ProjectRecord from '../models/Project';

class DesignRoute extends Component {
    render() {
        const src = `/preview/${this.props.params.projectName}/index.html`,
            routeId = parseInt(this.props.params.routeId);

        const route = getRoutes(this.props.project.routes)
            .find(route => route.id === routeId);

        return (
            <Desktop toolGroups={toolGroups}>
                <div style={{ marginTop: '40px' }}>
                    <PreviewIFrame
                        canSelect
                        canHighlight
                        store={store}
                        url={src}
                        path={route.path}
                    />
                </div>
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
