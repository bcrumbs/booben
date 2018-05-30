import React from 'react';
import { Button } from 'reactackle-button';
import { connect } from 'react-redux';

import {
  BlockContentBox,
  BlockContentViewButton,
  IconAdd,
} from '../../components';

import { ViewRouteTree } from './ViewRouteTree';
import { ViewRoutesList } from './ViewRoutesList';

import {
  toggleTreeViewMode,
} from '../../actions/desktop';

const colorScheme = 'default';

const AddButton = props => (
  <Button
    radius="rounded"
    colorScheme="flatLight"
    icon={<IconAdd size="custom" color="currentColor" />}
    {...props}
  />
);

const mapStateToProps = state => ({
  currentView: state.desktop.treeViewMode,
});

const mapDispatchToProps = dispatch => ({
  onToggleTreeViewMode: () =>
    void dispatch(toggleTreeViewMode()),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

const RouteTreeComponent = props => {
  // const currentView = 'routesList';
  // const currentView = 'routeTree';

  const changeViewButtonProps = props.currentView === 'routesList'
    ? {
      title: 'Routes',
    }
    : {
      title: 'Route_title',
      sectionTitle: 'Route',
      actionsSlot: <AddButton />,
    };

  const content = props.currentView === 'routesList'
    ? <ViewRoutesList />
    : <ViewRouteTree />;

  return [
    <BlockContentViewButton
      key="change-view-button"
      colorScheme={colorScheme}
      {...changeViewButtonProps}
      onClick={props.onToggleTreeViewMode}
    />,

    <BlockContentBox key="list" colorScheme={colorScheme}>
      {content}
    </BlockContentBox>
  ];
}

export const TreeView = wrap(RouteTreeComponent);
