/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import throttle from 'lodash.throttle';
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

import {
  getOutletComponentId,
  getParentComponentId,
} from '../../../../models/ProjectRoute';

import KeyCodes from '../../../../utils/keycodes';
import { noop, distance } from '../../../../utils/misc';
import { CANVAS_CONTAINER_ID } from '../constants';

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

class Preview extends Component {
  constructor(props, context) {
    super(props, context);
    
    this._container = null;

    this.willTryStartDrag = false;
    this.componentIdToDrag = -1;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.routes = null;
    this.routerKey = 0;

    this.unhighilightTimer = -1;
    this.unhighlightedComponentId = -1;

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
      
      if (this.unhighilightTimer > -1) clearImmediate(this.unhighilightTimer);
    }
  }

  enter() {
  }

  leave() {
    const { draggingOverPlaceholder, onDragOverNothing } = this.props;
    if (draggingOverPlaceholder) onDragOverNothing();
  }

  /**
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

    if (draggingComponent) {
      const placeholders = document.querySelectorAll('[data-jssy-placeholder]');

      let willSnap = false;
      let snapContainerId = -1;
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
  
    return -1;
  }

  /**
   *
   * @param {Object} route - ProjectRoute record
   * @param {boolean} isIndex
   * @param {number} enclosingComponentId
   * @return {Function}
   */
  _makeNonInteractiveBuilderForRoute(route, isIndex, enclosingComponentId) {
    const rootId = isIndex ? route.indexComponent : route.component;
    
    const ret = ({ params, children }) => (
      <Builder
        params={params}
        components={route.components}
        rootId={rootId}
        enclosingComponentId={enclosingComponentId}
        onNavigate={this._handleNavigate}
        onOpenURL={this._handleOpenURL}
      >
        {children}
      </Builder>
    );

    ret.displayName = `Builder(${rootId === -1 ? 'null' : rootId})`;
    return ret;
  }

  /**
   *
   * @param {Immutable.Map<number, Object>} routes
   * @param {number} routeId
   * @param {number} [enclosingComponentId=-1]
   * @return {Object}
   * @private
   */
  _createRoute(routes, routeId, enclosingComponentId = -1) {
    const route = routes.get(routeId);

    const ret = {
      path: route.path,
      component: this._makeNonInteractiveBuilderForRoute(
        route,
        false,
        enclosingComponentId,
      ),
    };

    const outletId = getOutletComponentId(route);

    const enclosingComponentIdForChildRoute = outletId > -1
      ? getParentComponentId(route, outletId)
      : -1;

    if (route.children.size > 0) {
      ret.childRoutes = route.children
        .map(childRouteId => this._createRoute(
            routes,
            childRouteId,
            enclosingComponentIdForChildRoute),
        )
        .toArray();
    }

    if (route.haveRedirect) {
      ret.onEnter = (_, replace) => replace(route.redirectTo);
    } else if (route.haveIndex) {
      ret.indexRoute = {
        component: this._makeNonInteractiveBuilderForRoute(
          route,
          true,
          enclosingComponentIdForChildRoute,
        ),
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
    this.routes = rootRouteIds
      .map(routeId => this._createRoute(routes, routeId))
      .toArray();

    this.routerKey++;
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

    // If we're not in nested constructor,
    // check if component is in current route
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

      if (componentId > -1 && this._canInteractWithComponent(componentId)) {
        if (this.unhighilightTimer > -1) {
          clearImmediate(this.unhighilightTimer);
          this.unhighilightTimer = -1;
        }

        if (this.unhighlightedComponentId !== componentId) {
          if (this.unhighlightedComponentId > -1)
            onUnhighlightComponent(this.unhighlightedComponentId);

          if (pickingComponent) {
            if (!pickingComponentFilter || pickingComponentFilter(componentId))
              onHighlightComponent(componentId);
          } else {
            onHighlightComponent(componentId);
          }
        }

        this.unhighlightedComponentId = -1;
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

      if (componentId > -1 && this._canInteractWithComponent(componentId)) {
        if (this.unhighilightTimer > -1) {
          clearImmediate(this.unhighilightTimer);
          onUnhighlightComponent(this.unhighlightedComponentId);
        }

        this.unhighilightTimer = setImmediate(() => {
          this.unhighilightTimer = -1;
          this.unhighlightedComponentId = -1;
          onUnhighlightComponent(componentId);
        });

        this.unhighlightedComponentId = componentId;
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
      
      if (componentId > -1 && this._canInteractWithComponent(componentId)) {
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
    
    hashHistory.push(path);
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
    
    if (currentRouteId === -1) return null;
    
    let route = project.routes.get(currentRouteId);
    let ret;
    
    if (currentRouteIsIndexRoute) {
      ret = (
        <Builder
          interactive
          components={route.components}
          rootId={route.component}
        >
          <Builder
            interactive
            components={route.components}
            rootId={route.indexComponent}
          />
        </Builder>
      );
    } else {
      ret = (
        <Builder
          interactive
          components={route.components}
          rootId={route.component}
        />
      );
    }
    
    while (route.parentId !== -1) {
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
    return (
      <Router
        key={this.routerKey}
        history={hashHistory}
        routes={this.routes}
      />
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
