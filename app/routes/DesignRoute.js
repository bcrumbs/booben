/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Desktop } from '../containers/Desktop/Desktop';
import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';
import store from '../store';

import {
    getRoutes
} from '../utils';

class DesignRoute extends Component {
    render() {
        const src = `/preview/${this.props.params.projectName}/index.html`;

        const route = getRoutes(this.props.routes).find(route => {
            return route.id == this.props.params.routeId;
        });

        return (
            <Desktop>
                <div style={{ marginTop: '40px' }}>
                    <PreviewIFrame
                        canSelect
                        canHighlight
                        store={store}
                        url={`${src}#${route.path}`}
                    />
                </div>
            </Desktop>
        );
    }
}

const mapStateToProps = state => ({
    routes: state.project.data.routes
});

export default connect(
    mapStateToProps
)(DesignRoute);
