/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

import {
  PropInput,
  PropTextarea,
  PropToggle,
} from '../../components/props';

import { PropsList } from '../../components/PropsList/PropsList';
import Project from '../../models/Project';
import { getLocalizedTextFromState } from '../../selectors';
import { updateRouteField } from '../../actions/project';
import { INVALID_ID } from '../../constants/misc';

const propTypes = {
  project: PropTypes.instanceOf(Project).isRequired,
  selectedRouteId: PropTypes.number.isRequired,
  indexRouteSelected: PropTypes.bool.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onPathChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onHaveIndexChange: PropTypes.func.isRequired,
  onRedirectChange: PropTypes.func.isRequired,
  onRedirectToChange: PropTypes.func.isRequired,
  onRedirectAuthenticatedChange: PropTypes.func.isRequired,
  onRedirectAnonymousChange: PropTypes.func.isRequired,
  onRedirectAuthenticatedToChange: PropTypes.func.isRequired,
  onRedirectAnonymousToChange: PropTypes.func.isRequired,
  onIndexRouteDescriptionChange: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
  project: state.project.data,
  selectedRouteId: state.project.selectedRouteId,
  indexRouteSelected: state.project.indexRouteSelected,
  language: state.app.language,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onPathChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'path', newValue)),

  onDescriptionChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'description', newValue)),

  onHaveIndexChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'haveIndex', newValue)),

  onRedirectChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'redirect', newValue)),

  onRedirectToChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'redirectTo', newValue)),

  onRedirectAuthenticatedChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'redirectAuthenticated', newValue)),

  onRedirectAnonymousChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'redirectAnonymous', newValue)),

  onRedirectAuthenticatedToChange: (routeId, newValue) =>
    void dispatch(updateRouteField(
      routeId,
      'redirectAuthenticatedTo',
      newValue,
    )),

  onRedirectAnonymousToChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'redirectAnonymousTo', newValue)),

  onIndexRouteDescriptionChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'indexRouteDescription', newValue)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

class RouteEditorComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._handlePathChange =
      this._handlePathChange.bind(this);
    this._handleDescriptionChange =
      this._handleDescriptionChange.bind(this);
    this._handleHaveIndexChange =
      this._handleHaveIndexChange.bind(this);
    this._handleRedirectChange =
      this._handleRedirectChange.bind(this);
    this._handleRedirectToChange =
      this._handleRedirectToChange.bind(this);
    this._handleIndexRouteDescriptionChange =
      this._handleIndexRouteDescriptionChange.bind(this);
    this._handleRedirectAuthenticatedChange =
      this._handleRedirectAuthenticatedChange.bind(this);
    this._handleRedirectAnonymousChange =
      this._handleRedirectAnonymousChange.bind(this);
    this._handleRedirectAuthenticatedToChange =
      this._handleRedirectAuthenticatedToChange.bind(this);
    this._handleRedirectAnonymousToChange =
      this._handleRedirectAnonymousToChange.bind(this);
  }

  _handlePathChange({ value }) {
    const { selectedRouteId, onPathChange } = this.props;
    onPathChange(selectedRouteId, value);
  }

  _handleDescriptionChange({ value }) {
    const { selectedRouteId, onDescriptionChange } = this.props;
    onDescriptionChange(selectedRouteId, value);
  }

  _handleHaveIndexChange({ value }) {
    const { selectedRouteId, onHaveIndexChange } = this.props;
    onHaveIndexChange(selectedRouteId, value);
  }

  _handleRedirectChange({ value }) {
    const { selectedRouteId, onRedirectChange } = this.props;
    onRedirectChange(selectedRouteId, value);
  }

  _handleRedirectToChange({ value }) {
    const { selectedRouteId, onRedirectToChange } = this.props;
    onRedirectToChange(selectedRouteId, value);
  }

  _handleRedirectAuthenticatedChange({ value }) {
    const { selectedRouteId, onRedirectAuthenticatedChange } = this.props;
    onRedirectAuthenticatedChange(selectedRouteId, value);
  }

  _handleRedirectAnonymousChange({ value }) {
    const { selectedRouteId, onRedirectAnonymousChange } = this.props;
    onRedirectAnonymousChange(selectedRouteId, value);
  }

  _handleRedirectAuthenticatedToChange({ value }) {
    const { selectedRouteId, onRedirectAuthenticatedToChange } = this.props;
    onRedirectAuthenticatedToChange(selectedRouteId, value);
  }

  _handleRedirectAnonymousToChange({ value }) {
    const { selectedRouteId, onRedirectAnonymousToChange } = this.props;
    onRedirectAnonymousToChange(selectedRouteId, value);
  }

  _handleIndexRouteDescriptionChange({ value }) {
    const { selectedRouteId, onIndexRouteDescriptionChange } = this.props;
    onIndexRouteDescriptionChange(selectedRouteId, value);
  }

  render() {
    const {
      project,
      selectedRouteId,
      indexRouteSelected,
      getLocalizedText,
    } = this.props;

    if (selectedRouteId === INVALID_ID) {
      const text = getLocalizedText('structure.noRouteSelected');
      return (
        <BlockContentPlaceholder text={text} />
      );
    }

    const route = project.routes.get(selectedRouteId);

    if (indexRouteSelected) {
      return (
        <BlockContentBox>
          <BlockContentBoxHeading>
            {getLocalizedText('structure.indexRouteProperties')}
          </BlockContentBoxHeading>

          <BlockContentBoxItem>
            <PropsList>
              <PropTextarea
                label={getLocalizedText('structure.routeDescription')}
                value={route.indexRouteDescription}
                onChange={this._handleIndexRouteDescriptionChange}
              />
            </PropsList>
          </BlockContentBoxItem>
        </BlockContentBox>
      );
    }

    let redirectPathInput = null;
    let haveIndexToggle = null;

    if (route.redirect) {
      redirectPathInput = (
        <PropInput
          label={getLocalizedText('structure.redirectTo')}
          value={route.redirectTo}
          onChange={this._handleRedirectToChange}
        />
      );
    } else {
      haveIndexToggle = (
        <PropToggle
          label={getLocalizedText('structure.indexRoute')}
          value={route.haveIndex}
          onChange={this._handleHaveIndexChange}
        />
      );
    }
    
    let redirectAuthenticatedToggle = null;
    let redirectAuthenticatedPathInput = null;
    let redirectAnonymousToggle = null;
    let redirectAnonymousPathInput = null;
    
    if (project.auth) {
      redirectAuthenticatedToggle = (
        <PropToggle
          label={getLocalizedText('structure.redirectAuthenticated')}
          value={route.redirectAuthenticated}
          onChange={this._handleRedirectAuthenticatedChange}
        />
      );

      redirectAnonymousToggle = (
        <PropToggle
          label={getLocalizedText('structure.redirectAnonymous')}
          value={route.redirectAnonymous}
          onChange={this._handleRedirectAnonymousChange}
        />
      );
      
      if (route.redirectAuthenticated) {
        redirectAuthenticatedPathInput = (
          <PropInput
            value={route.redirectAuthenticatedTo}
            onChange={this._handleRedirectAuthenticatedToChange}
          />
        );
      }
      
      if (route.redirectAnonymous) {
        redirectAnonymousPathInput = (
          <PropInput
            value={route.redirectAnonymousTo}
            onChange={this._handleRedirectAnonymousToChange}
          />
        );
      }
    }

    return (
      <BlockContentBox isBordered>
        <BlockContentBoxHeading>
          {getLocalizedText('structure.routeProperties')}
        </BlockContentBoxHeading>

        <BlockContentBoxItem>
          <PropsList>
            <PropInput
              label={getLocalizedText('structure.path')}
              value={route.path}
              disabled
              onChange={this._handlePathChange}
            />
  
            <PropTextarea
              label={getLocalizedText('structure.routeDescription')}
              value={route.description}
              onChange={this._handleDescriptionChange}
            />
  
            <PropToggle
              label={getLocalizedText('structure.indexRedirect')}
              value={route.redirect}
              onChange={this._handleRedirectChange}
            />

            {haveIndexToggle}
            {redirectPathInput}
            {redirectAuthenticatedToggle}
            {redirectAuthenticatedPathInput}
            {redirectAnonymousToggle}
            {redirectAnonymousPathInput}
          </PropsList>
        </BlockContentBoxItem>
      </BlockContentBox>
    );
  }
}

RouteEditorComponent.propTypes = propTypes;
RouteEditorComponent.defaultProps = defaultProps;
RouteEditorComponent.displayName = 'RouteEditor';

export const RouteEditor = wrap(RouteEditorComponent);
