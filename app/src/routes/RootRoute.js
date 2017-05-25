/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { loadProject } from '../actions/project';
import { ErrorScreen } from '../components/StateScreen/StateScreen';
import AppRoute from './AppRoute';
import PreviewRoute from './PreviewRoute';

import {
  NOT_LOADED,
  LOADING,
  LOADED,
  LOAD_ERROR,
} from '../constants/loadStates';

import { removeSplashScreen } from '../lib/dom';
import { PATH_PREVIEW } from '../constants/paths';

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
    
    const projectName = match.params.projectName;
    if (projectName) onProjectRequest(projectName);
  }

  componentDidUpdate() {
    const { projectLoadState } = this.props;

    const willRemoveSplashScreen =
      !this._spashScreenRemoved &&
      projectLoadState !== LOADING &&
      projectLoadState !== NOT_LOADED;

    if (willRemoveSplashScreen) this._removeSplashScreen();
  }
  
  _removeSplashScreen() {
    removeSplashScreen();
    this._spashScreenRemoved = true;
  }
  
  _renderError(message) {
    return (
      <ErrorScreen
        title="Failed to load project"
        message={message}
      />
    );
  }

  render() {
    const { match, projectLoadState, projectLoadError } = this.props;
  
    const projectName = match.params.projectName;
    
    if (!projectName) {
      this._removeSplashScreen();
      return this._renderError('Project name is not specified');
    }
    
    switch (projectLoadState) {
      case LOAD_ERROR: {
        return this._renderError(projectLoadError.message);
      }
      
      case LOADED: {
        return (
          <Switch>
            <Route
              exact
              path={PATH_PREVIEW}
              component={PreviewRoute}
            />
      
            <Route component={AppRoute} />
          </Switch>
        );
      }
      
      default: {
        return null;
      }
    }
  }
}

RootRoute.propTypes = propTypes;
RootRoute.defaultProps = defaultProps;
RootRoute.displayName = 'RootRoute';

export default wrap(RootRoute);
