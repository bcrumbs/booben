/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadProject } from '../actions/project';

import {
  NOT_LOADED,
  LOADING,
  LOAD_ERROR,
} from '../constants/loadStates';

class AppRoute extends PureComponent {
  componentDidMount() {
    const projectName = this.props.params.projectName;
    this.props.onProjectRequest(projectName);
  }

  render() {
    const {
      projectLoadState,
      projectLoadError,
      children,
    } = this.props;

    // TODO: Create loading screen
    if (projectLoadState === LOADING || projectLoadState === NOT_LOADED) {
      return (
        <div>
          Loading project...
        </div>
      );
    }

    // TODO: Create error screen
    if (projectLoadState === LOAD_ERROR) {
      return (
        <div>
          Failed to load project: {projectLoadError.message}
        </div>
      );
    }

    return children;
  }
}

AppRoute.propTypes = {
  params: PropTypes.shape({
    projectName: PropTypes.string.isRequired,
  }).isRequired,
  projectName: PropTypes.string.isRequired,
  projectLoadState: PropTypes.number.isRequired,
  projectLoadError: PropTypes.object.isRequired,
  onProjectRequest: PropTypes.func.isRequired,
};

AppRoute.displayName = 'AppRoute';

const mapStateToProps = ({ project }) => ({
  projectName: project.projectName,
  projectLoadState: project.loadState,
  projectLoadError: project.error,
});

const mapDispatchToProps = dispatch => ({
  onProjectRequest: name => void dispatch(loadProject(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppRoute);
