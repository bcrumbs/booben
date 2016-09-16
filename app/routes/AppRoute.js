/**
 * @author Dmitriy Bizyaev
 */

'use strict';

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

const mapStateToProps = state => ({
    projectName: state.project.projectName,
    projectLoadState: state.project.loadState,
    projectLoadError: state.project.error
});

const mapDispatchToProps = dispatch => ({
    onProjectRequest: name => void dispatch(loadProject(name))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppRoute);
