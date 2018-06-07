import React, { Component } from 'react';
import { Button } from 'reactackle-button';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import {
  BlockContentBox,
  BlockContentViewButton,
  IconAdd,
  RouteTree,
  RouteTreeList,
  RouteTreeItem,
  RouteTreeItemContent,
} from '../../components';

import { ViewRouteTree } from './ViewRouteTree';
import { ViewRoutesList } from './ViewRoutesList';
import { INVALID_ID } from '../../constants/misc';


import {
  createRoute,
} from '../../actions/project';

import {
  buildDesignRoutePath,
  buildDesignRouteIndexPath,
} from '../../constants/paths';

import {
  CreateRouteDialog,
} from '../route-dialogs';

import {
  getLocalizedTextFromState,
  currentRouteSelector,
  highlightedRouteIdsSelector,
} from '../../selectors';

import {
  expandRouteTreeItem,
  collapseRouteTreeItem,
} from '../../actions/design';

import { findComponent } from '../../lib/components';

import {
  selectRoute,
  highlightRoute,
  unhighlightRoute,
} from '../../actions/structure';

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
  project: state.project.data,
  projectName: state.project.projectName,
  highlightedComponentIds: highlightedRouteIdsSelector(state),
  currentRoute: currentRouteSelector(state),
  selectedRouteId: state.project.selectedRouteId,
  expandedRouteTreeItemIds: state.project.designer.expandedRouteTreeItemIds,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onHighlightItem: id => void dispatch(highlightRoute(id)),

  onUnhighlightItem: id => void dispatch(unhighlightRoute(id)),

  onCreateRoute: (parentRouteId, path, title, paramValues) =>
    void dispatch(createRoute(parentRouteId, path, title, paramValues)),

  onExpandItem: id => void dispatch(expandRouteTreeItem(id)),

  onCollapseItem: id => void dispatch(collapseRouteTreeItem(id)),

  onSelectRoute: (routeId, indexRouteSelected) =>
    void dispatch(selectRoute(routeId, indexRouteSelected)),

  onOpenDesigner: ({ projectName, routeId, isIndexRoute }) => {
    const path = isIndexRoute
      ? buildDesignRouteIndexPath({ projectName, routeId })
      : buildDesignRoutePath({ projectName, routeId });

    dispatch(push(path));
  },
});

const normalizePath = (rawPath, isRootRoute) =>
  isRootRoute ? `/${rawPath}` : rawPath;

const wrap = connect(
  mapStateToProps,
  mapDispatchToProps,
);

class RouteTreeComponent extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      createComponentMenuIsVisible: false,
      confirmDeleteComponentDialogIsVisible: false,
      confirmDeleteDialogIsVisible: false,
      createRouteDialogIsVisible: false,
      createRouteParentId: -1,
      editRoutePathDialogIsVisible: false,
      editingRouteId: INVALID_ID,
      newRoutePath: '',
      newRouteTitle: '',
      newRouteParamValues: {},
      pathPatternError: false,
    };
    
    this._handleHover = this._handleHover.bind(this);
    this._handleRouteSelect = this._handleRouteSelect.bind(this);
    this._handleExpand = this._handleExpand.bind(this);
    this._renderRouteItem = this._renderRouteItem.bind(this);
    this._renderRoutesList = this._renderRoutesList.bind(this);
    this._handleNewRoutePress = this._handleNewRoutePress.bind(this);
    this._handleCreateRouteDialogClose =
      this._handleCreateRouteDialogClose.bind(this);
    this._renderNewRouteDialog = this._renderNewRouteDialog.bind(this);
    this._handleCreateRouteDialogSubmit =
      this._handleCreateRouteDialogSubmit.bind(this);
  }

  _handleNewRoutePress({ parentRoute }) {
    const parentId = parentRoute ? parentRoute.id : -1;

    this.setState({
      createRouteDialogIsVisible: true,
      createRouteParentId: parentId,
      newRoutePath: '',
      newRouteTitle: '',
      newRouteParamValues: {},
    });
  }

  _handleCreateRouteDialogClose() {
    this.setState({
      createRouteDialogIsVisible: false,
      createRouteParentId: INVALID_ID,
    });
  }

  _handleCreateRouteDialogSubmit(data) {
    const { onCreateRoute } = this.props;
    const {
      createRouteParentId,
      newRoutePath,
      newRouteTitle,
      newRouteParamValues,
    } = data;

    const isRootRoute = createRouteParentId === -1;
    const title = newRouteTitle.trim();
    const path = normalizePath(newRoutePath, isRootRoute);

    onCreateRoute(createRouteParentId, path, title, newRouteParamValues);
  }

  _renderNewRouteDialog() {
    const {
      createRouteParentId,
      createRouteDialogIsVisible,
    } = this.state;

    if (!createRouteDialogIsVisible) return null;

    return (
      <CreateRouteDialog
        open
        parentRouteId={createRouteParentId}
        onSubmit={this._handleCreateRouteDialogSubmit}
        onClose={this._handleCreateRouteDialogClose}
      />
    );
  }

  _handleRouteSelect({ componentId }) {
    const {
      project,
      onSelectRoute,
      projectName,
      onOpenDesigner,
      currentRoute,
    } = this.props;

    const route = project.routes.get(componentId);
    onSelectRoute(route.id, route.haveIndex);

    if (currentRoute.id !== route.id) {
      onOpenDesigner({
        projectName,
        routeId: route.id,
        isIndexRoute: route.haveIndex,
      });
    }
  }

  _handleHover({ componentId, hovered }) {
    const {
      onHighlightItem,
      onUnhighlightItem
    } = this.props;

    if (hovered) onHighlightItem(componentId);
    else onUnhighlightItem(componentId);
  }

  _handleExpand({ componentId, expanded }) {
    const { onExpandItem, onCollapseItem } = this.props;

    if (expanded) onExpandItem(componentId);
    else onCollapseItem(componentId);
  }

  _renderRouteItem(routeId) {
    const {
      project,
      expandedRouteTreeItemIds,
      getLocalizedText,
      selectedRouteId,
      highlightedComponentIds,
    } = this.props;

    const route = project.routes.get(routeId);

    const {
      title,
      redirect,
      redirectAnonymous,
      redirectAuthenticated,
      id,
      parentId,
    } = route;

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
        outletWarningTooltip = getLocalizedText(
          'structure.noOutletMarkTooltip',
        );
      }
    }

    const hasRedirect = redirect || redirectAnonymous || redirectAuthenticated;

    const subLevel = this._renderRoutesList(routeId);
    const expanded = expandedRouteTreeItemIds.has(id);
    const hasSubLevel = subLevel.size > 0;

    const active = id === selectedRouteId;
    const parentRoute = project.routes.get(parentId);
    // console.log('highlightedComponentIds', highlightedComponentIds.toJS());
    // console.log('id', id);
    // console.log(highlightedComponentIds.has(id));
    const hovered = highlightedComponentIds.has(id);

    return (
      <RouteTreeItem key={String(id)}>
        <RouteTreeItemContent
          onHover={this._handleHover}
          active={active}
          hovered={hovered}
          warningMessage={outletWarningTooltip}
          hasRedirect={hasRedirect}
          componentId={id}
          onExpand={this._handleExpand}
          onAddButtonClick={() => this._handleNewRoutePress({ parentRoute })}
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
      return route.children.map(id => (
        <RouteTreeList key={id} level={0}>
          {this._renderRouteItem(id)}
        </RouteTreeList>
      ));
    }
  }

  render() {
    const newRouteDialog = this._renderNewRouteDialog();
    const content = this._renderRoutesList(INVALID_ID);
    return (
      <BlockContentBox key="list" colorScheme={colorScheme}>
        <RouteTree>{content}</RouteTree>
        {newRouteDialog}
      </BlockContentBox>
    );
  }
}

export const RouteTreeView = wrap(RouteTreeComponent);
