/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'

import { loadProject } from '../actions/project';

import {
    NOT_LOADED,
    LOADING,
    LOAD_ERROR
} from '../constants/loadStates';

class AppRoute extends Component {
    componentDidMount() {
        const projectName = this.props.params.projectName;
        this.props.onProjectRequest(projectName);
    }

    render() {
        const loadState = this.props.projectLoadState;

        // TODO: Create loading screen
        if (loadState === LOADING || loadState === NOT_LOADED)
            return <div>Loading project...</div>;

        // TODO: Create error screen
        if (loadState === LOAD_ERROR)
            return <div>Failed to load project: {this.props.projectLoadError.message}</div>;

        return this.props.children;
    }
}

AppRoute.propTypes = {
    projectName: PropTypes.string,
    projectLoadState: PropTypes.number,
    projectLoadError: PropTypes.object,
    onProjectRequest: PropTypes.func
};

AppRoute.displayName = 'AppRoute';

const mapStateToProps = ({ project }) => ({
    projectName: project.projectName,
    projectLoadState: project.loadState,
    projectLoadError: project.error
});

const mapDispatchToProps = dispatch => ({
    onProjectRequest: name => void dispatch(loadProject(name))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppRoute);
