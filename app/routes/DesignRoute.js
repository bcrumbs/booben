/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { PreviewIFrame } from '../components/PreviewIFrame';
import store from '../store';

import {
    getRoutes
} from '../utils';

class DesignRoute extends Component {
    render() {
        const _src = `/preview/${this.props.params.projectName}/index.html`;
        const _route = getRoutes(this.props.routes).find((route) => {
            return route.id == this.props.params.routeId;
        });

        return (
            <PreviewIFrame
                externalStore={store}
                canSelected={true}
                previewAppURL={`${_src}#${_route.path}`}
            />
        );
    }
}

const mapStateToProps = state => ({
    routes: state.project.data.routes
});

export default connect(
    mapStateToProps
)(DesignRoute);
