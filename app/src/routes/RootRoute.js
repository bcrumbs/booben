/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { loadProject } from '../actions/project';
import { ErrorScreen } from '../components/StateScreen/StateScreen';
import AppRoute from './AppRoute';
import PreviewRoute from './PreviewRoute';

import {
  NOT_LOADED,
  LOADING,
  LOAD_ERROR,
} from '../constants/loadStates';

import { removeSplashScreen } from '../utils/dom';

const propTypes = {
  match: PropTypes.object.isRequired, // router
  projectLoadState: PropTypes.number, // state
  projectLoadError: PropTypes.object, // state
  onProjectRequest: PropTypes.func.isRequired, // dispatch
};

const defaultProps = {
  projectLoadState: NOT_LOADED,
  projectLoadError: null,
};

const mapStateToProps = ({ project }) => ({
  projectName: project.projectName,
  projectLoadState: project.loadState,
  projectLoadError: project.error,
});

const mapDispatchToProps = dispatch => ({
  onProjectRequest: name => void dispatch(loadProject(name)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

class RootRoute extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._spashScreenRemoved = false;
  }

  componentDidMount() {
    const { match, onProjectRequest } = this.props;
    onProjectRequest(match.params.projectName);
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
    const { projectLoadState, projectLoadError } = this.props;

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

    return (
      <Switch>
        <Route
          path="/:projectName/preview"
          component={PreviewRoute}
        />
        
        <Route component={AppRoute} />
      </Switch>
    );
  }
}

RootRoute.propTypes = propTypes;
RootRoute.defaultProps = defaultProps;
RootRoute.displayName = 'RootRoute';

export default wrap(RootRoute);
