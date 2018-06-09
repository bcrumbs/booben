import React from "react";
import { connect } from "react-redux";

import {
  RouteTree,
  RouteTreeList,
  RouteTreeItem,
  RouteTreeItemContent,
  BlockContentBox,
} from "../../components";

import { ComponentsTreeView } from "../ComponentsTreeView/ComponentsTreeView";

import {
  expandRouteTreeItem,
  collapseRouteTreeItem,
} from '../../actions/design';

import { currentRouteSelector } from "../../selectors/index";
import { INVALID_ID } from "../../constants/misc";

import { RouteContentViewButton } from './RouteContentViewButton'

const mapStateToProps = state => ({
  routes: state.project.data.routes,
  currentRoute: currentRouteSelector(state),
  expandedRouteTreeItemIds: state.project.designer.expandedRouteTreeItemIds,
});

const mapDispatchToProps = dispatch => ({
  onExpandItem: id =>
    void dispatch(expandRouteTreeItem(id)),

  onCollapseItem: id =>
    void dispatch(collapseRouteTreeItem(id)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

const colorScheme = "default";

export const ViewRoutes = ({ currentRoute, expandedRouteTreeItemIds, ...props }) => {
  const _handleExpand = ({ componentId, expanded }) => {
    const { onExpandItem, onCollapseItem } = props;

    if (expanded) onExpandItem(componentId);
    else onCollapseItem(componentId);
  };

  const _renderRouteTree = () => {
    const expanded = expandedRouteTreeItemIds.has(currentRoute.id);

    if (currentRoute.id !== INVALID_ID) {
      return (
        <RouteTreeList level={0}>
          <RouteTreeItem>
            <RouteTreeItemContent
              componentId={currentRoute.id}
              onExpand={_handleExpand}
              title={currentRoute.title}
              hasSubLevel
              expanded={expanded}
            />
            {expanded && <ComponentsTreeView />}
          </RouteTreeItem>
        </RouteTreeList>
      );
    }
  };

  const content = _renderRouteTree();

  return (
    <BlockContentBox colorScheme={colorScheme} isBordered>
      <RouteTree>{content}</RouteTree>
    </BlockContentBox>
  );
};

export const ViewRoutesList = wrap(ViewRoutes);
