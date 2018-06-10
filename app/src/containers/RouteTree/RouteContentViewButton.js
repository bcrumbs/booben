import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ProjectRoute from '../../models/ProjectRoute';

// import { currentRouteSelector } from '../../selectors/index';

import { BlockContentViewButton } from '../../components';

import { toggleTreeViewMode } from '../../actions/desktop';

import {
  getLocalizedTextFromState,
  currentRouteSelector,
} from '../../selectors';

const propTypes = {
  ...BlockContentViewButton.propTypes,
  getLocalizedText: PropTypes.func.isRequired,
  currentRoute: PropTypes.instanceOf(ProjectRoute).isRequired,
  onToggleTreeViewMode: PropTypes.func.isRequired,
};

const defaultProps = {
  ...BlockContentViewButton.defaultProps,
};

const mapStateToProps = state => ({
  currentRoute: currentRouteSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onToggleTreeViewMode: () => void dispatch(toggleTreeViewMode()),
});

const wrap = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const colorScheme = 'default';


const ContentViewButton = ({
  getLocalizedText,
  currentRoute,
  onToggleTreeViewMode,
}) => {
  const formatRouteTitle = () => getLocalizedText(
    'structure.routeTreeEditorTitle',
  );

  const title = currentRoute ? currentRoute.title : '';

  const changeViewButtonProps = {
    title: formatRouteTitle(title),
  };

  return (
    <BlockContentViewButton
      colorScheme={colorScheme}
      {...changeViewButtonProps}
      onClick={onToggleTreeViewMode}
    />
  );
};

ContentViewButton.propTypes = propTypes;
ContentViewButton.defaultProps = defaultProps;

export const RouteContentViewButton = wrap(ContentViewButton);
