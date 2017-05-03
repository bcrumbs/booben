/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Router, Switch, Route, Redirect } from 'react-router';
import { connect } from 'react-redux';
import throttle from 'lodash.throttle';
import createHistory from 'history/createBrowserHistory';
import Builder from './Builder';

import {
  toggleComponentSelection,
  selectPreviewComponent,
  highlightPreviewComponent,
  unhighlightPreviewComponent,
  dragOverPlaceholder,
  dragOverNothing,
} from '../../../../actions/preview';

import {
  pickComponentDone,
  pickComponentCancel,
} from '../../../../actions/project';

import { topNestedConstructorSelector } from '../../../../selectors';
import Project, { getComponentById } from '../../../../models/Project';
import KeyCodes from '../../../../utils/keycodes';
import { noop, distance } from '../../../../utils/misc';
import { CANVAS_CONTAINER_ID } from '../constants';
import { INVALID_ID } from '../../../../constants/misc';

const propTypes = {
  interactive: PropTypes.bool,
  project: PropTypes.instanceOf(Project).isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  draggingOverPlaceholder: PropTypes.bool.isRequired,
  placeholderContainerId: PropTypes.number.isRequired,
  placeholderAfter: PropTypes.number.isRequired,
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentStateSlot: PropTypes.bool.isRequired,
  pickingComponentFilter: PropTypes.func,
  highlightingEnabled: PropTypes.bool.isRequired,
  currentRouteId: PropTypes.number.isRequired,
  currentRouteIsIndexRoute: PropTypes.bool.isRequired,
  topNestedConstructor: PropTypes.any,
  onToggleComponentSelection: PropTypes.func.isRequired,
  onSelectSingleComponent: PropTypes.func.isRequired,
  onHighlightComponent: PropTypes.func.isRequired,
  onUnhighlightComponent: PropTypes.func.isRequired,
  onPickComponent: PropTypes.func.isRequired,
  onCancelPickComponent: PropTypes.func.isRequired,
  onDragOverPlaceholder: PropTypes.func.isRequired,
  onDragOverNothing: PropTypes.func.isRequired,
  onDropZoneSnap: PropTypes.func,
  onDropZoneUnsnap: PropTypes.func,
};

const contextTypes = {
  window: PropTypes.object.isRequired,
  document: PropTypes.object.isRequired,
};

const defaultProps = {
  interactive: false,
  topNestedConstructor: null,
  pickingComponentFilter: null,
  onDropZoneSnap: noop,
  onDropZoneUnsnap: noop,
};

const mapStateToProps = state => ({
  project: state.project.data,
  draggingComponent: state.project.draggingComponent,
  draggingOverPlaceholder: state.project.draggingOverPlaceholder,
  placeholderContainerId: state.project.placeholderContainerId,
  placeholderAfter: state.project.placeholderAfter,
  pickingComponent: state.project.pickingComponent,
  pickingComponentStateSlot: state.project.pickingComponentStateSlot,
  pickingComponentFilter: state.project.pickingComponentFilter,
  highlightingEnabled: state.project.highlightingEnabled,
  currentRouteId: state.project.currentRouteId,
  currentRouteIsIndexRoute: state.project.currentRouteIsIndexRoute,
  topNestedConstructor: topNestedConstructorSelector(state),
});

const mapDispatchToProps = dispatch => ({
  onToggleComponentSelection: componentId =>
    void dispatch(toggleComponentSelection(componentId)),
  
  onSelectSingleComponent: componentId =>
    void dispatch(selectPreviewComponent(componentId, true, true)),
  
  onHighlightComponent: componentId =>
    void dispatch(highlightPreviewComponent(componentId)),
  
  onUnhighlightComponent: componentId =>
    void dispatch(unhighlightPreviewComponent(componentId)),
  
  onPickComponent: componentId =>
    void dispatch(pickComponentDone(componentId)),
  
  onCancelPickComponent: () =>
    void dispatch(pickComponentCancel()),

  onDragOverPlaceholder: (containerId, afterIdx) =>
    void dispatch(dragOverPlaceholder(containerId, afterIdx)),

  onDragOverNothing: () =>
    void dispatch(dragOverNothing()),
});

const setImmediate = window.setImmediate || (fn => setTimeout(fn, 0));
const clearImmediate = window.clearImmediate || window.clearTimeout;

const SNAP_DISTANCE = 200;

const readContainerId = element =>
  parseInt(element.getAttribute('data-jssy-container-id'), 10);

const readAfterIdx = element =>
  parseInt(element.getAttribute('data-jssy-after'), 10);

const getOutletPosition = components => {
  const outlet = components.find(component => component.name === 'Outlet');
  if (!outlet) return null;
  
  const parent = outlet.parentId !== INVALID_ID
    ? components.get(outlet.parentId)
    : null;
  
  if (!parent) {
    return {
      enclosingComponent: null,
      enclosingComponentChildrenNames: [],
      enclosingComponentPosition: 0,
    };
  }
  
  const outletPosition = parent.children.keyOf(outlet.id);
  const childrenNames = parent.children
    .map(childId => components.get(childId).name)
    .toJS();
  
  childrenNames.splice(outletPosition, 1);
  
  return {
    enclosingComponent: parent,
    enclosingComponentChildrenNames: childrenNames,
    enclosingComponentPosition: outletPosition,
  };
};

class Preview extends Component {
  constructor(props, context) {
    super(props, context);
    
    this._container = null;
    this._routes = null;
    this._routerKey = 0;
    this._unhighilightTimer = -1;
    this._unhighlightedComponentId = INVALID_ID;
    this._draggingOverCanvas = false;

    this._handleMouseOver = this._handleMouseOver.bind(this);
    this._handleMouseOut = this._handleMouseOut.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleNavigate = this._handleNavigate.bind(this);
    this._handleOpenURL = this._handleOpenURL.bind(this);

    this.drag = throttle(this.drag.bind(this), 100);

    this._updateRoutes(props.project.routes, props.project.rootRoutes);
  }

  componentDidMount() {
    const { interactive } = this.props;
    const { window } = this.context;
    
    if (interactive) {
      const containerNode = this._getContainer();
      containerNode.addEventListener('mouseover', this._handleMouseOver, false);
      containerNode.addEventListener('mouseout', this._handleMouseOut, false);
      containerNode.addEventListener('mousedown', this._handleMouseDown, false);
      containerNode.addEventListener('click', this._handleClick, false);
      containerNode.addEventListener('mouseup', this._handleMouseUp);
      window.addEventListener('keydown', this._handleKeyDown);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { project, interactive } = this.props;
    
    if (interactive && nextProps.project !== project) {
      this._updateRoutes(
        nextProps.project.routes,
        nextProps.project.rootRoutes,
      );
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      project,
      topNestedConstructor,
      currentRouteId,
      currentRouteIsIndexRoute,
      draggingOverPlaceholder,
      placeholderContainerId,
      placeholderAfter,
    } = this.props;
    
    return nextProps.project !== project ||
      nextProps.topNestedConstructor !== topNestedConstructor ||
      nextProps.currentRouteId !== currentRouteId ||
      nextProps.currentRouteIsIndexRoute !== currentRouteIsIndexRoute ||
      nextProps.draggingOverPlaceholder !== draggingOverPlaceholder ||
      nextProps.placeholderContainerId !== placeholderContainerId ||
      nextProps.placeholderAfter !== placeholderAfter;
  }

  componentDidUpdate() {
    const {
      draggingOverPlaceholder,
      placeholderContainerId,
      placeholderAfter,
      onDropZoneSnap,
      onDropZoneUnsnap,
    } = this.props;

    const { document } = this.context;

    if (draggingOverPlaceholder) {
      const selector =
        '[data-jssy-placeholder]' +
        `[data-jssy-container-id="${placeholderContainerId}"]` +
        `[data-jssy-after="${placeholderAfter}"]`;

      const placeholderElement = document.querySelector(selector);

      if (placeholderElement)
        onDropZoneSnap({ element: placeholderElement });
      else
        onDropZoneUnsnap();
    } else {
      onDropZoneUnsnap();
    }
  }

  componentWillUnmount() {
    const { interactive } = this.props;
    const { window } = this.context;
    
    if (interactive) {
      const containerNode = this._getContainer();
      
      containerNode.removeEventListener(
        'mouseover',
        this._handleMouseOver,
        false,
      );
      
      containerNode.removeEventListener(
        'mouseout',
        this._handleMouseOut,
        false,
      );
      
      containerNode.removeEventListener(
        'mousedown',
        this._handleMouseDown,
        false,
      );
      
      containerNode.removeEventListener('click', this._handleClick, false);
      containerNode.removeEventListener('mouseup', this._handleMouseUp);
      window.removeEventListener('keydown', this._handleKeyDown);
      
      if (this._unhighilightTimer > -1) clearImmediate(this._unhighilightTimer);
    }
  }

  /**
   * Called by Canvas component
   */
  enter() {
    this._draggingOverCanvas = true;
  }

  /**
   * Called by Canvas component
   */
  leave() {
    const { draggingOverPlaceholder, onDragOverNothing } = this.props;
    this._draggingOverCanvas = false;
    if (draggingOverPlaceholder) onDragOverNothing();
  }

  /**
   * Called by Canvas component
   *
   * @param {number} x
   * @param {number} y
   * @private
   */
  drag({ x, y }) {
    const {
      draggingComponent,
      draggingOverPlaceholder,
      placeholderContainerId,
      placeholderAfter,
      onDragOverPlaceholder,
      onDragOverNothing,
    } = this.props;

    const { document } = this.context;

    // Although ComponentsDragArea doesn't call onDrag after onLeave,
    // this method can be called later because it's throttled,
    // so we need to check if we're still here
    if (!this._draggingOverCanvas) return;

    if (draggingComponent) {
      const placeholders = document.querySelectorAll('[data-jssy-placeholder]');

      let willSnap = false;
      let snapContainerId = INVALID_ID;
      let snapAfterIdx = -1;
      let minDistance = Infinity;

      if (placeholders.length === 1) {
        const element = placeholders[0];
        willSnap = true;
        snapContainerId = readContainerId(element);
        snapAfterIdx = readAfterIdx(element);
      } else if (placeholders.length > 1) {
        placeholders.forEach(element => {
          const { left, top } = element.getBoundingClientRect();
          if (Math.abs(left - x) > SNAP_DISTANCE) return;
          if (Math.abs(top - y) > SNAP_DISTANCE) return;
    
          const snapPointDistance = distance(left, top, x, y);
          if (snapPointDistance > SNAP_DISTANCE) return;
    
          if (snapPointDistance < minDistance) {
            willSnap = true;
            minDistance = snapPointDistance;
            snapContainerId = readContainerId(element);
            snapAfterIdx = readAfterIdx(element);
          }
        });
      }

      if (willSnap) {
        const willUpdatePlaceholder =
          !draggingOverPlaceholder ||
          placeholderContainerId !== snapContainerId ||
          placeholderAfter !== snapAfterIdx;

        if (willUpdatePlaceholder)
          onDragOverPlaceholder(snapContainerId, snapAfterIdx);
      } else if (draggingOverPlaceholder) {
        onDragOverNothing();
      }
    }
  }
  
  /**
   *
   * @return {HTMLElement}
   * @private
   */
  _getContainer() {
    const { document } = this.context;
    
    if (this._container) return this._container;
    this._container = document.getElementById(CANVAS_CONTAINER_ID);
    return this._container;
  }
  
  /**
   *
   * @param {HTMLElement} element
   * @return {?number}
   */
  _getClosestComponentId(element) {
    const containerNode = this._getContainer();
    let current = element;
  
    while (current) {
      if (element === containerNode) break;
    
      if (current.nodeType !== Node.ELEMENT_NODE) {
        current = current.parentNode;
        continue;
      }
    
      const dataJssyId = current.getAttribute('data-jssy-id');
      if (dataJssyId) return parseInt(dataJssyId, 10);
      if (current.hasAttribute('data-reactroot')) break;
      current = current.parentNode;
    }
  
    return INVALID_ID;
  }

  /**
   *
   * @param {Object} route - ProjectRoute record
   * @param {boolean} isIndex
   * @return {Function}
   */
  _makeNonInteractiveBuilderForRoute(route, isIndex) {
    const rootId = isIndex ? route.indexComponent : route.component;
    
    const childSwitch = (!isIndex && route.children.size > 0)
      ? this._renderSwitch(route.children)
      : null;
    
    const ret = ({ match }) => (
      <Builder
        params={match.params}
        components={route.components}
        rootId={rootId}
        onNavigate={this._handleNavigate}
        onOpenURL={this._handleOpenURL}
      >
        {childSwitch}
      </Builder>
    );

    ret.displayName = `Builder(route-${route.id}${isIndex ? '-index' : ''})`;
    return ret;
  }
  
  _renderSwitch(routeIds) {
    const { project } = this.props;
    const routes = [];
  
    routeIds.forEach(routeId => {
      const route = project.routes.get(routeId);
    
      if (route.haveIndex) {
        const IndexRouteBuilder =
          this._makeNonInteractiveBuilderForRoute(route, true);
      
        routes.push(
          <Route
            key={`${routeId}-index`}
            path={route.fullPath}
            exact
            component={IndexRouteBuilder}
          />,
        );
      } else if (route.haveRedirect) {
        routes.push(
          <Route
            key={`${routeId}-index-redirect`}
            path={route.fullPath}
            exact
            render={() => (
              <Redirect to={route.redirectTo} />
            )}
          />,
        );
      }
    
      const RouteBuilder =
        this._makeNonInteractiveBuilderForRoute(route, false);
    
      routes.push(
        <Route
          key={routeId}
          path={route.fullPath}
          component={RouteBuilder}
        />,
      );
    });
    
    return (
      <Switch>
        {routes}
      </Switch>
    );
  }

  /**
   *
   * @param {Immutable.Map<number, Object>} routes
   * @param {number} routeId
   * @return {Object}
   * @private
   */
  _createRoute(routes, routeId) {
    const route = routes.get(routeId);

    const ret = {
      path: route.path,
      component: this._makeNonInteractiveBuilderForRoute(route, false),
    };

    if (route.children.size > 0) {
      ret.childRoutes = route.children
        .map(childRouteId => this._createRoute(routes, childRouteId))
        .toArray();
    }

    if (route.haveRedirect) {
      ret.onEnter = (_, replace) => replace(route.redirectTo);
    } else if (route.haveIndex) {
      ret.indexRoute = {
        component: this._makeNonInteractiveBuilderForRoute(route, true),
      };
    }

    return ret;
  }

  /**
   * Build routes config for react-router
   *
   * @param {Immutable.Map} routes
   * @param {Immutable.List<number>} rootRouteIds
   * @private
   */
  _updateRoutes(routes, rootRouteIds) {
    this._routes = rootRouteIds
      .map(routeId => this._createRoute(routes, routeId))
      .toArray();

    this._routerKey++;
  }

  /**
   *
   * @param {number} componentId
   * @return {boolean}
   * @private
   */
  _componentIsInCurrentRoute(componentId) {
    const { project, currentRouteId, currentRouteIsIndexRoute } = this.props;
    
    const component = getComponentById(project, componentId);

    return component.routeId === currentRouteId &&
      component.isIndexRoute === currentRouteIsIndexRoute;
  }

  /**
   *
   * @param {number} componentId
   * @return {boolean}
   * @private
   */
  _canInteractWithComponent(componentId) {
    const { topNestedConstructor } = this.props;
    
    // We can interact with any component in nested constructors
    if (topNestedConstructor) return true;

    // If we're not in a nested constructor,
    // check if the component is in the current route
    return this._componentIsInCurrentRoute(componentId);
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseOver(event) {
    const {
      highlightingEnabled,
      pickingComponent,
      pickingComponentFilter,
      onHighlightComponent,
      onUnhighlightComponent,
    } = this.props;
    
    if (highlightingEnabled) {
      const componentId = this._getClosestComponentId(event.target);

      if (
        componentId !== INVALID_ID &&
        this._canInteractWithComponent(componentId)
      ) {
        if (this._unhighilightTimer > -1) {
          clearImmediate(this._unhighilightTimer);
          this._unhighilightTimer = -1;
        }

        if (this._unhighlightedComponentId !== componentId) {
          if (this._unhighlightedComponentId !== INVALID_ID)
            onUnhighlightComponent(this._unhighlightedComponentId);

          if (pickingComponent) {
            if (!pickingComponentFilter || pickingComponentFilter(componentId))
              onHighlightComponent(componentId);
          } else {
            onHighlightComponent(componentId);
          }
        }

        this._unhighlightedComponentId = INVALID_ID;
      }
    }
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseOut(event) {
    const { highlightingEnabled, onUnhighlightComponent } = this.props;
    
    if (highlightingEnabled) {
      const componentId = this._getClosestComponentId(event.target);

      if (
        componentId !== INVALID_ID &&
        this._canInteractWithComponent(componentId)
      ) {
        if (this._unhighilightTimer > -1) {
          clearImmediate(this._unhighilightTimer);
          onUnhighlightComponent(this._unhighlightedComponentId);
        }

        this._unhighilightTimer = setImmediate(() => {
          this._unhighilightTimer = -1;
          this._unhighlightedComponentId = INVALID_ID;
          onUnhighlightComponent(componentId);
        });

        this._unhighlightedComponentId = componentId;
      }
    }
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleClick(event) {
    const {
      pickingComponent,
      pickingComponentFilter,
      onToggleComponentSelection,
      onSelectSingleComponent,
      onPickComponent,
    } = this.props;
    
    if (event.button === 0) { // Left button
      const componentId = this._getClosestComponentId(event.target);
      
      if (
        componentId !== INVALID_ID &&
        this._canInteractWithComponent(componentId)
      ) {
        if (pickingComponent) {
          if (!pickingComponentFilter || pickingComponentFilter(componentId))
            onPickComponent(componentId);
        } else if (event.ctrlKey) {
          onToggleComponentSelection(componentId);
        } else {
          onSelectSingleComponent(componentId);
        }
      }
    }
  }
  
  /**
   *
   * @param {KeyboardEvent} event
   * @private
   */
  _handleKeyDown(event) {
    const {
      pickingComponent,
      pickingComponentStateSlot,
      onCancelPickComponent,
    } = this.props;
    
    if (event.keyCode === KeyCodes.ESCAPE) {
      if ((pickingComponent || pickingComponentStateSlot))
        onCancelPickComponent();
    }
  }
  
  /**
   *
   * @param {number} routeId
   * @param {Object<string, *>} routeParams
   * @private
   */
  _handleNavigate({ routeId, routeParams }) {
    const { project } = this.props;
    
    const route = project.routes.get(routeId);
    if (!route) return;
    
    const path = route.fullPath
      .split('/')
      .map(
        part => part.startsWith(':')
          ? String(routeParams[part.slice(1)])
          : part,
      )
      .join('/');
    
    // hashHistory.push(path);
  }
  
  /**
   *
   * @param {string} url
   * @param {boolean} newWindow
   * @private
   */
  _handleOpenURL({ url, newWindow }) {
    const { window } = this.context;
    
    const doc = window.top.document;
    const a = doc.createElement('a');
    
    a.setAttribute('href', url);
    if (newWindow) a.setAttribute('target', '_blank');
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
  }
  
  /**
   *
   * @return {?ReactElement}
   * @private
   */
  _renderCurrentRoute() {
    const { project, currentRouteId, currentRouteIsIndexRoute } = this.props;
    
    if (currentRouteId === INVALID_ID) return null;
    
    let route = project.routes.get(currentRouteId);
    let ret;
    
    if (currentRouteIsIndexRoute) {
      const outletPosition = getOutletPosition(route.components);
  
      let enclosingComponent = null;
      let enclosingComponentChildrenNames = [];
      let enclosingComponentPosition = 0;
  
      if (outletPosition) {
        enclosingComponent = outletPosition.enclosingComponent;
        enclosingComponentChildrenNames =
          outletPosition.enclosingComponentChildrenNames;
    
        enclosingComponentPosition = outletPosition.enclosingComponentPosition;
      }
      
      ret = (
        <Builder
          interactive
          components={route.components}
          rootId={route.component}
        >
          <Builder
            interactive
            editable
            components={route.components}
            rootId={route.indexComponent}
            enclosingComponent={enclosingComponent}
            enclosingComponentChildrenNames={enclosingComponentChildrenNames}
            enclosingComponentPosition={enclosingComponentPosition}
          />
        </Builder>
      );
    } else {
      const parentRoute = route.parentId === INVALID_ID
        ? null
        : project.routes.get(route.parentId);
  
      const outletPosition = parentRoute
        ? getOutletPosition(parentRoute.components)
        : null;
  
      let enclosingComponent = null;
      let enclosingComponentChildrenNames = [];
      let enclosingComponentPosition = 0;
  
      if (outletPosition) {
        enclosingComponent = outletPosition.enclosingComponent;
        enclosingComponentChildrenNames =
          outletPosition.enclosingComponentChildrenNames;
    
        enclosingComponentPosition = outletPosition.enclosingComponentPosition;
      }
      
      ret = (
        <Builder
          interactive
          editable
          components={route.components}
          rootId={route.component}
          enclosingComponent={enclosingComponent}
          enclosingComponentChildrenNames={enclosingComponentChildrenNames}
          enclosingComponentPosition={enclosingComponentPosition}
        />
      );
    }
    
    while (route.parentId !== INVALID_ID) {
      route = project.routes.get(route.parentId);

      ret = (
        <Builder
          interactive
          components={route.components}
          rootId={route.component}
        >
          {ret}
        </Builder>
      );
    }

    return ret;
  }
  
  _renderTopNestedConstructor() {
    const { topNestedConstructor } = this.props;
    
    return (
      <Builder
        interactive
        components={topNestedConstructor.components}
        rootId={topNestedConstructor.rootId}
        ignoreOwnerProps
      />
    );
  }
  
  _renderInteractivePreview() {
    const { topNestedConstructor } = this.props;
  
    return topNestedConstructor
      ? this._renderTopNestedConstructor()
      : this._renderCurrentRoute();
  }
  
  _renderNonInteractivePreview() {
    const { project } = this.props;
    
    const history = createHistory();
    const rootSwitch = this._renderSwitch(project.rootRoutes);
    
    return (
      <Router
        key={this._routerKey}
        history={history}
      >
        {rootSwitch}
      </Router>
    );
  }

  render() {
    const { interactive } = this.props;
  
    return interactive
      ? this._renderInteractivePreview()
      : this._renderNonInteractivePreview();
  }
}

Preview.propTypes = propTypes;
Preview.contextTypes = contextTypes;
Preview.defaultProps = defaultProps;
Preview.displayName = 'Preview';

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(Preview);
