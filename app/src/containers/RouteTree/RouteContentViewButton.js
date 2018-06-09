import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Button } from "reactackle-button";
import { currentRouteSelector } from "../../selectors/index";
import { BlockContentViewButton, IconAdd } from "../../components";
import { toggleTreeViewMode } from "../../actions/desktop";
import { getLocalizedTextFromState } from "../../selectors";

const propTypes = {
  ...BlockContentViewButton.propTypes,
};

const defaultProps = {
  ...BlockContentViewButton.defaultProps,
};

const mapStateToProps = state => ({
  currentRoute: currentRouteSelector(state),
  getLocalizedText: getLocalizedTextFromState(state)
});

const mapDispatchToProps = dispatch => ({
  onToggleTreeViewMode: () => void dispatch(toggleTreeViewMode())
});

const AddButton = props => (
  <Button
    radius="rounded"
    colorScheme="flatLight"
    icon={<IconAdd size="custom" color="currentColor" />}
    {...props}
  />
);

const wrap = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const colorScheme = "default";

const ContentViewButton = ({
  getLocalizedText,
  currentRoute,
  onToggleTreeViewMode,
  addButtonAction,
}) => {
  const formatRouteTitle = title => getLocalizedText(
      "structure.routeTreeEditorTitle"
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
