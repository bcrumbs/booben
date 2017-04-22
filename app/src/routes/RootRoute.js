/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadProject } from '../actions/project';
import { ErrorScreen } from '../components/StateScreen/StateScreen';

import {
  NOT_LOADED,
  LOADING,
  LOAD_ERROR,
} from '../constants/loadStates';

import { removeSplashScreen } from '../utils/dom';

class RootRoute extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._spashScreenRemoved = false;
  }

  componentDidMount() {
    const projectName = this.props.params.projectName;
    this.props.onProjectRequest(projectName);
  }

  componentDidUpdate() {
    const { projectLoadState } = this.props;

    const willRemoveSplashScreen =
      !this._spashScreenRemoved &&
      projectLoadState !== LOADING &&
      projectLoadState !== NOT_LOADED;

    if (willRemoveSplashScreen) {
      removeSplashScreen();
      this._spashScreenRemoved = true;
    }
  }

  render() {
    const {
      projectLoadState,
      projectLoadError,
      children,
    } = this.props;

    if (projectLoadState === LOADING || projectLoadState === NOT_LOADED)
      return null;

    if (projectLoadState === LOAD_ERROR) {
      return (
        <ErrorScreen
          title="Failed to load project"
          message={projectLoadError.message}
        />
      );
    }

    return children;
  }
}

RootRoute.propTypes = {
  params: PropTypes.shape({
    projectName: PropTypes.string.isRequired,
  }).isRequired,
  projectName: PropTypes.string,
  projectLoadState: PropTypes.number,
  projectLoadError: PropTypes.object,
  onProjectRequest: PropTypes.func.isRequired,
};

RootRoute.defaultProps = {
  projectName: '',
  projectLoadState: NOT_LOADED,
  projectLoadError: null,
};

RootRoute.displayName = 'RootRoute';

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
)(RootRoute);
