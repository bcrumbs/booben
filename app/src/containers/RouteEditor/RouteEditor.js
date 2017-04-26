/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

import { PropsList } from '../../components/PropsList/PropsList';

import {
  PropInput,
  PropTextarea,
  PropToggle,
} from '../../components/props';

import { getLocalizedTextFromState } from '../../selectors';
import ProjectRouteRecord from '../../models/ProjectRoute';
import { updateRouteField } from '../../actions/project';
import { INVALID_ID } from '../../constants/misc';

class RouteEditorComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._handlePathChange =
      this._handlePathChange.bind(this);
    this._handleDescriptionChange =
      this._handleDescriptionChange.bind(this);
    this._handleHaveIndexChange =
      this._handleHaveIndexChange.bind(this);
    this._handleHaveRedirectChange =
      this._handleHaveRedirectChange.bind(this);
    this._handleRedirectToChange =
      this._handleRedirectToChange.bind(this);
    this._handleIndexRouteDescriptionChange =
      this._handleIndexRouteDescriptionChange.bind(this);
  }

  _handlePathChange({ value }) {
    this.props.onPathChange(this.props.selectedRouteId, value);
  }

  _handleDescriptionChange({ value }) {
    this.props.onDescriptionChange(this.props.selectedRouteId, value);
  }

  _handleHaveIndexChange({ value }) {
    this.props.onHaveIndexChange(this.props.selectedRouteId, value);
  }

  _handleHaveRedirectChange({ value }) {
    this.props.onHaveRedirectChange(this.props.selectedRouteId, value);
  }

  _handleRedirectToChange({ value }) {
    this.props.onRedirectToChange(this.props.selectedRouteId, value);
  }

  _handleIndexRouteDescriptionChange({ value }) {
    this.props.onIndexRouteDescriptionChange(this.props.selectedRouteId, value);
  }

  render() {
    const { getLocalizedText } = this.props;

    if (this.props.selectedRouteId === INVALID_ID) {
      const text = getLocalizedText('structure.noRouteSelected');
      return (
        <BlockContentPlaceholder text={text} />
      );
    }

    const route = this.props.routes.get(this.props.selectedRouteId);

    if (this.props.indexRouteSelected) {
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

    let redirectUrlInput = null,
      haveIndexToggle = null;

    if (route.haveRedirect) {
      redirectUrlInput = (
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
              value={route.haveRedirect}
              onChange={this._handleHaveRedirectChange}
            />

            {haveIndexToggle}
            {redirectUrlInput}
          </PropsList>
        </BlockContentBoxItem>
      </BlockContentBox>
    );
  }
}

//noinspection JSUnresolvedVariable
RouteEditorComponent.propTypes = {
  routes: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectRouteRecord),
    PropTypes.number,
  ).isRequired,

  selectedRouteId: PropTypes.number.isRequired,
  indexRouteSelected: PropTypes.bool.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onPathChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onHaveIndexChange: PropTypes.func.isRequired,
  onHaveRedirectChange: PropTypes.func.isRequired,
  onRedirectToChange: PropTypes.func.isRequired,
  onIndexRouteDescriptionChange: PropTypes.func.isRequired,
};

RouteEditorComponent.displayName = 'RouteEditor';

const mapStateToProps = ({ project, app }) => ({
  routes: project.data.routes,
  selectedRouteId: project.selectedRouteId,
  indexRouteSelected: project.indexRouteSelected,
  language: app.language,
  getLocalizedText: getLocalizedTextFromState({ app }),
});

const mapDispatchToProps = dispatch => ({
  onPathChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'path', newValue)),

  onDescriptionChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'description', newValue)),

  onHaveIndexChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'haveIndex', newValue)),

  onHaveRedirectChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'haveRedirect', newValue)),

  onRedirectToChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'redirectTo', newValue)),

  onIndexRouteDescriptionChange: (routeId, newValue) =>
    void dispatch(updateRouteField(routeId, 'indexRouteDescription', newValue)),
});

export const RouteEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RouteEditorComponent);
