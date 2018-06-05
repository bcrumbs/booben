import React, { Component } from "react";
import { Button } from "reactackle-button";
import { connect } from "react-redux";

import {
  BlockContentBox,
  BlockContentViewButton,
  IconAdd,
  RouteTree,
  RouteTreeList,
  RouteTreeItem,
  RouteTreeItemContent
} from "../../components";

import { ViewRouteTree } from "./ViewRouteTree";
import { ViewRoutesList } from "./ViewRoutesList";
import { INVALID_ID } from "../../constants/misc";

import { getLocalizedTextFromState } from '../../selectors';

import {
  expandRouteTreeItem,
  collapseRouteTreeItem,
} from '../../actions/design';

import { findComponent } from '../../lib/components';

import { selectRoute } from '../../actions/structure';

const colorScheme = "default";

const AddButton = props => (
  <Button
    radius="rounded"
    colorScheme="flatLight"
    icon={<IconAdd size="custom" color="currentColor" />}
    {...props}
  />
);

const mapStateToProps = state => ({
  project: state.project.data,
  expandedRouteTreeItemIds: state.project.designer.expandedRouteTreeItemIds,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onExpandItem: id =>
    void dispatch(expandRouteTreeItem(id)),

  onCollapseItem: id =>
    void dispatch(collapseRouteTreeItem(id)),
    
  onSelectRoute: (routeId, indexRouteSelected) => 
    void dispatch(selectRoute(routeId, indexRouteSelected)),
});

const wrap = connect(
  mapStateToProps,
  mapDispatchToProps,
);

class RouteTreeComponent extends Component {
  constructor(props, context) {
    super(props, context);

    this._handleRouteSelect = this._handleRouteSelect.bind(this);
    this._handleExpand = this._handleExpand.bind(this);
    this._renderRouteItem = this._renderRouteItem.bind(this);
    this._renderRoutesList = this._renderRoutesList.bind(this);
  }

  _handleRouteSelect({ componentId }) {
    const { project, onSelectRoute } = this.props;

    const route = project.routes.get(componentId);
    onSelectRoute(route.id, route.haveIndex);
  }

  _handleExpand({ componentId, expanded }) {
    const { onExpandItem, onCollapseItem } = this.props;

    if (expanded) onExpandItem(componentId);
    else onCollapseItem(componentId);
  }

  _renderRouteItem(routeId) {
    const { project, expandedRouteTreeItemIds, getLocalizedText } = this.props;

    const route = project.routes.get(routeId);

    const { title, redirect, redirectAnonymous, redirectAuthenticated, id } = route;

    let outletWarning = false;
    let outletWarningTooltip = '';

    if (route.children.size > 0) {
      const outlet = findComponent(
        route.components,
        route.component,
        component => component.name === 'Outlet',
      );

      if (outlet === null) {
        outletWarning = true;
        outletWarningTooltip =
          getLocalizedText('structure.noOutletMarkTooltip');
      }
    }

    const hasRedirect = redirect || redirectAnonymous || redirectAuthenticated;

    const subLevel = this._renderRoutesList(routeId);
    const expanded = expandedRouteTreeItemIds.has(id);
    const hasSubLevel = subLevel.size > 0;

    return (
      <RouteTreeItem key={String(id)}>
        <RouteTreeItemContent
          warningMessage={outletWarningTooltip}
          hasRedirect={hasRedirect}
          componentId={id}
          onExpand={this._handleExpand}
          title={title}
          expanded={expanded}
          hasSubLevel={hasSubLevel}
          onSelect={this._handleRouteSelect}
        />
        {hasSubLevel && expanded ? subLevel : null}
      </RouteTreeItem>
    );
  }

  _renderRoutesList(routeId) {
    const { project } = this.props;
    const { rootRoutes } = project;

    const route = project.routes.get(routeId);

    if (routeId === INVALID_ID) {
      return rootRoutes.map(rootId => (
        <RouteTreeList key={rootId} level={0}>
          {this._renderRouteItem(rootId)}
        </RouteTreeList>
      ));
    } else {
      return route.children.map(id =>
        <RouteTreeList key={id} level={0}>
          {this._renderRouteItem(id)}
        </RouteTreeList>,
      );
    }
  }


  render() {
    const content = this._renderRoutesList(INVALID_ID);
    return (
      <BlockContentBox key="list" colorScheme={colorScheme}>
        <RouteTree>{content}</RouteTree>
      </BlockContentBox>
    );
  }
}

export const RouteTreeView = wrap(RouteTreeComponent);
