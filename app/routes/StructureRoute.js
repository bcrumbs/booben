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

import {
    createRoute,
    deleteRoute,
    renameRoute
} from '../actions/project';

class StructureRoute extends Component {
    constructor(props) {
        super(props);
    }

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
    ),

    onCreateRoute: PropTypes.func,
    onDeleteRoute: PropTypes.func,
    onRenameRoute: PropTypes.func
};

StructureRoute.displayName = 'StructureRoute';

const mapStateToProps = state => ({
    routes: state.project.data.routes
});

const mapDispatchToProps = dispatch => ({
    onCreateRoute: (where, path, title) => void dispatch(createRoute(where, path, title)),
    onDeleteRoute: (where, idx) => void dispatch(deleteRoute(where, idx)),
    onRenameRoute: (where, idx, newTitle) => void dispatch(renameRoute(where, idx, newTitle))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StructureRoute);
