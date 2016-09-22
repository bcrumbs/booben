/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { Desktop } from '../containers/Desktop/Desktop';

import toolGroups from '../tools/structure';

import ProjectRouteRecord from '../models/ProjectRoute';

class StructureRoute extends Component {
    render() {
        return (
            <Desktop toolGroups={toolGroups}>

            </Desktop>
        )
    }
}

StructureRoute.propTypes = {
    routes: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(ProjectRouteRecord)
    )
};

StructureRoute.displayName = 'StructureRoute';

const mapStateToProps = state => ({
    routes: state.project.data.routes
});

export default connect(mapStateToProps)(StructureRoute);
