import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { BlockContentViewButton } from '../../components';

import { toggleTreeViewMode } from '../../actions/desktop';

import {
  getLocalizedTextFromState,
} from '../../selectors';

const propTypes = {
  ...BlockContentViewButton.propTypes,
  getLocalizedText: PropTypes.func.isRequired,
  onToggleTreeViewMode: PropTypes.func.isRequired,
};

const defaultProps = {
  ...BlockContentViewButton.defaultProps,
};

const mapStateToProps = state => ({
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
  onToggleTreeViewMode,
}) => {
  const title = getLocalizedText(
    'structure.routeTreeEditorTitle',
  );

  return (
    <BlockContentViewButton
      colorScheme={colorScheme}
      title={title}
      onClick={onToggleTreeViewMode}
    />
  );
};

ContentViewButton.propTypes = propTypes;
ContentViewButton.defaultProps = defaultProps;

export const RouteContentViewButton = wrap(ContentViewButton);
