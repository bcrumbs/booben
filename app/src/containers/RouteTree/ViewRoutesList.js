import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  RouteTree,
  RouteTreeList,
  RouteTreeItem,
  RouteTreeItemContent,
  BlockContentBox,
} from '../../components';

import { ComponentsTreeView } from '../ComponentsTreeView/ComponentsTreeView';
import ProjectRoute from '../../models/ProjectRoute';
import * as JssyPropTypes from '../../constants/common-prop-types';

import {
  expandRouteTreeItem,
  collapseRouteTreeItem,
} from '../../actions/design';

import { currentRouteSelector } from '../../selectors/index';
import { INVALID_ID } from '../../constants/misc';

const propTypes = {
  currentRoute: PropTypes.instanceOf(ProjectRoute).isRequired,
  expandedRouteTreeItemIds: JssyPropTypes.setOfIds.isRequired,
};

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

const colorScheme = 'default';

export const ViewRoutes = ({
  currentRoute,
  expandedRouteTreeItemIds,
  ...props
}) => {
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
    return null;
  };

  const content = _renderRouteTree();

  return (
    <BlockContentBox colorScheme={colorScheme}>
      <RouteTree>{content}</RouteTree>
    </BlockContentBox>
  );
};

ViewRoutes.propTypes = propTypes;

export const ViewRoutesList = wrap(ViewRoutes);
