import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Shortcuts } from 'react-shortcuts';

import {
  BlockContentBox,
  RouteTree,
  RouteTreeList,
  RouteTreeItem,
  RouteTreeItemContent,
} from '../../components';

import * as JssyPropTypes from '../../constants/common-prop-types';
import { INVALID_ID } from '../../constants/misc';

import { createRoute } from '../../actions/project';
import { toggleTreeViewMode } from '../../actions/desktop';
import Project from '../../models/Project';
import ProjectRoute from '../../models/ProjectRoute';

import {
  buildDesignRoutePath,
  buildDesignRouteIndexPath,
} from '../../constants/paths';

import { CreateRouteDialog } from '../route-dialogs';

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
import { noop } from '../../utils/misc';

const colorScheme = 'default';

const propTypes = {
  project: PropTypes.instanceOf(Project).isRequired,
  projectName: PropTypes.string.isRequired,
  indexRouteSelected: PropTypes.bool.isRequired, // store
  highlightedComponentIds: JssyPropTypes.setOfIds.isRequired,
  currentRoute: PropTypes.instanceOf(ProjectRoute),
  selectedRouteId: PropTypes.number.isRequired,
  expandedRouteTreeItemIds: JssyPropTypes.setOfIds.isRequired,
  getLocalizedText: PropTypes.func,
  onSelectRoute: PropTypes.func.isRequired,
  onOpenDesigner: PropTypes.func.isRequired,
  onExpandItem: PropTypes.func.isRequired,
  onCollapseItem: PropTypes.func.isRequired,
  onCreateRoute: PropTypes.func.isRequired,
  onHighlightItem: PropTypes.func.isRequired,
  onUnhighlightItem: PropTypes.func.isRequired,
  onToggleTreeViewMode: PropTypes.func.isRequired,
};

const defaultProps = {
  getLocalizedText: noop,
  currentRoute: INVALID_ID,
};

const mapStateToProps = state => ({
  project: state.project.data,
  projectName: state.project.projectName,
  indexRouteSelected: state.project.indexRouteSelected,
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
    void dispatch(selectRoute(routeId, indexRouteSelected, true)),

  onOpenDesigner: ({ projectName, routeId, isIndexRoute }) => {
    const path = isIndexRoute
      ? buildDesignRouteIndexPath({ projectName, routeId })
      : buildDesignRoutePath({ projectName, routeId });

    dispatch(push(path));
  },

  onToggleTreeViewMode: () =>
    void dispatch(toggleTreeViewMode()),
});

const normalizePath = (rawPath, isRootRoute) =>
  isRootRoute ? `/${rawPath}` : rawPath;

const isRouteEditable = (routes, routeId, isIndexRoute) => {
  const parentIds = [];

  if (isIndexRoute) {
    parentIds.push(routeId);
  }

  let currentRoute = routes.get(routeId);

  while (currentRoute.parentId !== INVALID_ID) {
    parentIds.push(currentRoute.parentId);
    currentRoute = routes.get(currentRoute.parentId);
  }

  return parentIds.every(id => {
    const route = routes.get(id);
    const outlet = findComponent(
      route.components,
      route.component,
      component => component.name === 'Outlet',
    );

    return outlet !== null;
  });
};

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

    this._handleShortcuts = this._handleShortcuts.bind(this);
    this._handleMoveSelectionVertically =
      this._handleMoveSelectionVertically.bind(this);
    this._handleSelectChildRoute = this._handleSelectChildRoute.bind(this);
    this._handleSelectParentComponent =
      this._handleSelectParentComponent.bind(this);
    this._handleHover = this._handleHover.bind(this);
    this._handleRouteSelect = this._handleRouteSelect.bind(this);
    this._handleOpenComponentsTree = this._handleOpenComponentsTree.bind(this);
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

  _handleShortcuts(action) {
    switch (action) {
      case 'SELECT_NEXT_ROUTE': {
        this._handleMoveSelectionVertically('down');
        break;
      }

      case 'SELECT_PREVIOUS_ROUTE': {
        this._handleMoveSelectionVertically('up');
        break;
      }

      case 'SELECT_CHILD_ROUTE': {
        this._handleSelectChildRoute();
        break;
      }

      case 'SELECT_PARENT_ROUTE': {
        this._handleSelectParentComponent();
        break;
      }

      default:
    }
  }

  _handleMoveSelectionVertically(direction) {
    const {
      project,
      projectName,
      currentRoute,
      selectedRouteId,
      onSelectRoute,
      onOpenDesigner,
    } = this.props;

    const selectedRoute = project.routes.get(selectedRouteId);

    if (selectedRoute.parentId === INVALID_ID) {
      const position = project.rootRoutes.indexOf(selectedRouteId);
      const nextPosition = direction === 'down' ? position + 1 : position - 1;

      if (nextPosition < 0 || nextPosition > project.rootRoutes.size - 1) {
        return;
      }
      const newRouteId = project.rootRoutes.get(nextPosition);
      const newRoute = project.routes.get(newRouteId);
      onSelectRoute(newRouteId, newRoute.haveIndex);

      if (currentRoute.id !== newRouteId) {
        onOpenDesigner({
          projectName,
          routeId: newRouteId,
          isIndexRoute: newRoute.haveIndex,
        });
      }
    } else {
      const parentRoute = project.routes.get(selectedRoute.parentId);
      const position = parentRoute.children.indexOf(selectedRouteId);
      const nextPosition = direction === 'down' ? position + 1 : position - 1;

      if (nextPosition < 0 || nextPosition > parentRoute.children.size - 1) {
        return;
      }
      const newRouteId = parentRoute.children.get(nextPosition);
      const newRoute = project.routes.get(newRouteId);
      onSelectRoute(newRouteId, newRoute.haveIndex);

      if (currentRoute.id !== newRouteId) {
        onOpenDesigner({
          projectName,
          routeId: newRouteId,
          isIndexRoute: newRoute.haveIndex,
        });
      }
    }
  }

  _handleSelectChildRoute() {
    const {
      project,
      projectName,
      selectedRouteId,
      onSelectRoute,
      currentRoute,
      expandedRouteTreeItemIds,
      onExpandItem,
      onOpenDesigner,
    } = this.props;

    const selectedRoute = project.routes.get(selectedRouteId);
    if (selectedRoute.children.size === 0) return;

    if (!expandedRouteTreeItemIds.has(selectedRoute)) {
      onExpandItem(selectedRoute);
    }
    const newRouteId = selectedRoute.children.first();
    const newRoute = project.routes.get(newRouteId);

    onSelectRoute(newRouteId, newRoute.haveIndex);

    if (currentRoute.id !== newRouteId) {
      onOpenDesigner({
        projectName,
        routeId: newRouteId,
        isIndexRoute: newRoute.haveIndex,
      });
    }
  }

  _handleSelectParentComponent() {
    const {
      project,
      projectName,
      selectedRouteId,
      onSelectRoute,
      currentRoute,
      onOpenDesigner,
    } = this.props;

    const selectedRoute = project.routes.get(selectedRouteId);
    const newRouteId = selectedRoute.parentId;
    const newRoute = project.routes.get(newRouteId);

    if (selectedRoute.parentId === INVALID_ID) return;

    onSelectRoute(newRoute.id, newRoute.haveIndex);

    if (currentRoute.id !== newRouteId) {
      onOpenDesigner({
        projectName,
        routeId: newRouteId,
        isIndexRoute: newRoute.haveIndex,
      });
    }
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
    const {
      onCreateRoute,
      onExpandItem,
    } = this.props;

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
    onExpandItem(createRouteParentId);
  }

  _renderNewRouteDialog() {
    const { createRouteParentId, createRouteDialogIsVisible } = this.state;

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
      indexRouteSelected,
    } = this.props;

    const route = project.routes.get(componentId);

    const isEditable = isRouteEditable(
      project.routes,
      componentId,
      indexRouteSelected,
    );

    if (isEditable) {
      onOpenDesigner({
        projectName,
        routeId: route.id,
        isIndexRoute: route.haveIndex,
      });
    }
    
    onSelectRoute(route.id, route.haveIndex);
  }

  _handleOpenComponentsTree() {
    this.props.onToggleTreeViewMode();
  }

  _handleHover({ componentId, hovered }) {
    const { onHighlightItem, onUnhighlightItem } = this.props;

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
    const parentRoute = project.routes.get(id);
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
          onOpenComponentsTree={this._handleOpenComponentsTree}
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
      <Shortcuts
        name="ROUTES_LIST"
        handler={this._handleShortcuts} // eslint-disable-line react/jsx-handler-names
        targetNodeSelector="body"
        className="rct-shortcuts-wrapper"
      >
        <BlockContentBox key="list" colorScheme={colorScheme} isBordered>
          <RouteTree>{content}</RouteTree>
          {newRouteDialog}
        </BlockContentBox>
      </Shortcuts>
    );
  }
}

RouteTreeComponent.propTypes = propTypes;
RouteTreeComponent.defaultProps = defaultProps;

export const RouteTreeView = wrap(RouteTreeComponent);
