import React from 'react';
import { connect } from "react-redux";

import { currentRouteSelector } from "../../selectors/index";

import {
  BlockContentViewButton,
} from "../../components";

const mapStateToProps = state => ({
  currentRoute: currentRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

const colorScheme = "default";

const ContentViewButton = ({ currentRoute }) => {
  const formatRouteTitle = title => `route: ${title}`.toUpperCase();

  const changeViewButtonProps = {
    title: formatRouteTitle(currentRoute.title),
    // actionsSlot: <AddButton />,
  };

  return (
    <BlockContentViewButton
      colorScheme={colorScheme}
      {...changeViewButtonProps}
    />
  );
};

export const RouteContentViewButton = wrap(ContentViewButton);

