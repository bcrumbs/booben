/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import Builder from './Builder';

import {
  toggleComponentSelection,
  selectPreviewComponent,
  highlightPreviewComponent,
  unhighlightPreviewComponent,
  startDragExistingComponent,
  dragOverComponent,
  dragOverPlaceholder,
  dropComponent,
  DropComponentAreas,
} from '../../app/actions/preview';

import {
  pickComponentDone,
  pickComponentCancel,
} from '../../app/actions/project';

import { topNestedConstructorSelector } from '../../app/selectors';
import { getComponentById } from '../../app/models/Project';

import {
  getOutletComponentId,
  getParentComponentId,
} from '../../app/models/ProjectRoute';

import KeyCodes from '../../app/utils/keycodes';
import { pointIsInCircle } from '../../app/utils/misc';
import { PREVIEW_DOM_CONTAINER_ID } from '../../shared/constants';

const propTypes = {
  interactive: PropTypes.bool,
  
  // Can't use ImmutablePropTypes.record or
  // PropTypes.instanceOf(ProjectRecord) here
  // 'cause this value comes from another frame
  // with another instance of immutable.js
  project: PropTypes.any.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentFilter: PropTypes.func,
  highlightingEnabled: PropTypes.bool.isRequired,
  currentRouteId: PropTypes.number.isRequired,
  currentRouteIsIndexRoute: PropTypes.bool.isRequired,
  topNestedConstructor: PropTypes.any,
  onToggleComponentSelection: PropTypes.func.isRequired,
  onSelectSingleComponent: PropTypes.func.isRequired,
  onHighlightComponent: PropTypes.func.isRequired,
  onUnhighlightComponent: PropTypes.func.isRequired,
  onComponentStartDrag: PropTypes.func.isRequired,
  onDragOverComponent: PropTypes.func.isRequired,
  onDragOverPlaceholder: PropTypes.func.isRequired,
  onDropComponent: PropTypes.func.isRequired,
  onPickComponent: PropTypes.func.isRequired,
  onCancelPickComponent: PropTypes.func.isRequired,
};

const defaultProps = {
  interactive: false,
  topNestedConstructor: null,
  pickingComponentFilter: null,
};

const mapStateToProps = state => ({
  project: state.project.data,
  draggingComponent: state.project.draggingComponent,
  pickingComponent: state.project.pickingComponent,
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
    void dispatch(selectPreviewComponent(componentId, true)),
  
  onHighlightComponent: componentId =>
    void dispatch(highlightPreviewComponent(componentId)),
  
  onUnhighlightComponent: componentId =>
    void dispatch(unhighlightPreviewComponent(componentId)),
  
  onComponentStartDrag: componentId =>
    void dispatch(startDragExistingComponent(componentId)),
  
  onDragOverComponent: componentId =>
    void dispatch(dragOverComponent(componentId)),
  
  onDragOverPlaceholder: (containerId, afterIdx) =>
    void dispatch(dragOverPlaceholder(containerId, afterIdx)),
  
  onDropComponent: area =>
    void dispatch(dropComponent(area)),
  
  onPickComponent: componentId =>
    void dispatch(pickComponentDone(componentId)),
  
  onCancelPickComponent: () => void dispatch(pickComponentCancel()),
});

const setImmediate = window.setImmediate || (fn => setTimeout(fn, 0));
const clearImmediate = window.clearImmediate || window.clearTimeout;

/**
 *
 * @type {?HTMLElement}
 */
let _container = null;

/**
 *
 * @return {HTMLElement}
 */
const getContainer = () =>
  _container ||
  (_container = document.getElementById(PREVIEW_DOM_CONTAINER_ID));

/**
 *
 * @type {number}
 * @const
 */
const START_DRAG_THRESHOLD = 10;

/**
 *
 * @param {HTMLElement} el
 * @return {?number}
 */
const getClosestComponentId = el => {
  const containerNode = getContainer();
  let current = el;

  while (current) {
    if (el === containerNode) break;

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
};

/**
 * @typedef {Object} OverWhat
 * @property {boolean} isPlaceholder
 * @property {?number} componentId
 * @property {?number} placeholderAfter
 * @property {?number} containerId
 */

/**
 *
 * @param {HTMLElement} el
 * @return {?OverWhat}
 */
const getClosestComponentOrPlaceholder = el => {
  let current = el;

  while (current) {
    if (current.nodeType !== Node.ELEMENT_NODE) {
      if (!current.parentNode) break;
      current = current.parentNode;
      continue;
    }

    const dataJssyId = current.getAttribute('data-jssy-id');

    if (dataJssyId) {
      return {
        isPlaceholder: false,
        componentId: parseInt(dataJssyId, 10),
        placeholderAfter: null,
        containerId: null,
      };
    } else {
      const isPlaceholder = current.hasAttribute('data-jssy-placeholder');

      if (isPlaceholder) {
        const after =
          parseInt(current.getAttribute('data-jssy-after'), 10);
        const containerId =
          parseInt(current.getAttribute('data-jssy-container-id'), 10);

        return {
          isPlaceholder: true,
          componentId: null,
          placeholderAfter: after,
          containerId,
        };
      }
    }

    if (current.hasAttribute('data-reactroot')) break;
    current = current.parentNode;
  }

  return null;
};

class Preview extends Component {
  constructor(props) {
    super(props);

    this.willTryStartDrag = false;
    this.componentIdToDrag = -1;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.routes = null;
    this.routerKey = 0;

    this.unhighilightTimer = -1;
    this.unhighlightedComponentId = -1;

    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._handleMouseOver = this._handleMouseOver.bind(this);
    this._handleMouseOut = this._handleMouseOut.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleNavigate = this._handleNavigate.bind(this);
    this._handleOpenURL = this._handleOpenURL.bind(this);

    this._updateRoutes(props.project.routes, props.project.rootRoutes);
  }

  componentDidMount() {
    const { interactive } = this.props;
    
    if (interactive) {
      const containerNode = getContainer();
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
    } = this.props;
    
    return nextProps.project !== project ||
      nextProps.topNestedConstructor !== topNestedConstructor ||
      nextProps.currentRouteId !== currentRouteId ||
      nextProps.currentRouteIsIndexRoute !== currentRouteIsIndexRoute;
  }

  componentWillUnmount() {
    const { interactive } = this.props;
    
    if (interactive) {
      const containerNode = getContainer();
      
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

  /**
   *
   * @param {Immutable.Map<number, ProjectComponent>} components
   * @param {number} rootId
   * @param {number} enclosingComponentId
   * @return {Function}
   */
  _makeBuilder(components, rootId, enclosingComponentId) {
    const ret = ({ children }) => (
      <Builder
        components={components}
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
      component: this._makeBuilder(
        route.components,
        route.component,
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
        component: this._makeBuilder(
          route.components,
          route.indexComponent,
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
  _handleMouseDown(event) {
    if (event.button !== 0 || !event.ctrlKey) return;

    event.preventDefault();

    //noinspection JSCheckFunctionSignatures
    const componentId = getClosestComponentId(event.target);

    if (componentId > -1 && this._canInteractWithComponent(componentId)) {
      getContainer().addEventListener('mousemove', this._handleMouseMove);
      this.componentIdToDrag = componentId;
      this.dragStartX = event.pageX;
      this.dragStartY = event.pageY;
      this.willTryStartDrag = true;
    }
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseMove(event) {
    const { onComponentStartDrag } = this.props;
    
    if (this.willTryStartDrag) {
      const willStartDrag = !pointIsInCircle(
        event.pageX,
        event.pageY,
        this.dragStartX,
        this.dragStartY,
        START_DRAG_THRESHOLD,
      );

      if (willStartDrag) {
        getContainer().removeEventListener('mousemove', this._handleMouseMove);
        this.willTryStartDrag = false;
        onComponentStartDrag(this.componentIdToDrag);
      }
    }
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseUp(event) {
    const { draggingComponent, onDropComponent } = this.props;
    
    if (draggingComponent) {
      event.stopPropagation();
      this.willTryStartDrag = false;
      onDropComponent(DropComponentAreas.PREVIEW);
    }
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
      draggingComponent,
      onDragOverComponent,
      onDragOverPlaceholder,
      onHighlightComponent,
      onUnhighlightComponent,
    } = this.props;
    
    if (highlightingEnabled) {
      //noinspection JSCheckFunctionSignatures
      const componentId = getClosestComponentId(event.target);

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

    if (draggingComponent) {
      //noinspection JSCheckFunctionSignatures
      const overWhat = getClosestComponentOrPlaceholder(event.target);
      if (overWhat !== null) {
        if (overWhat.isPlaceholder) {
          onDragOverPlaceholder(
            overWhat.containerId,
            overWhat.placeholderAfter,
          );
        } else if (this._canInteractWithComponent(overWhat.componentId)) {
          onDragOverComponent(overWhat.componentId);
        }
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
      //noinspection JSCheckFunctionSignatures
      const componentId = getClosestComponentId(event.target);

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
      //noinspection JSCheckFunctionSignatures
      const componentId = getClosestComponentId(event.target);
      
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
    const { pickingComponent, onCancelPickComponent } = this.props;
    
    if (pickingComponent && event.keyCode === KeyCodes.ESCAPE)
      onCancelPickComponent();
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
  _createBuilderForCurrentRoute() {
    const { project, currentRouteId, currentRouteIsIndexRoute } = this.props;
    
    let routeId = currentRouteId;
    if (routeId === -1) return null;
  
    let ret = null;
    let route = project.routes.get(routeId);
    let rootComponentId = currentRouteIsIndexRoute
      ? route.indexComponent
      : route.component;

    do {
      ret = (
        <Builder
          interactive
          components={route.components}
          rootId={rootComponentId}
        >
          {ret}
        </Builder>
      );

      routeId = route.parentId;

      if (routeId > -1) {
        route = project.routes.get(routeId);
        rootComponentId = route.component;
      } else {
        route = null;
        rootComponentId = -1;
      }
    }
    while (route);

    return ret;
  }

  render() {
    const { interactive, topNestedConstructor } = this.props;
    
    if (interactive) {
      if (topNestedConstructor) {
        return (
          <Builder
            interactive
            components={topNestedConstructor.components}
            rootId={topNestedConstructor.rootId}
            ignoreOwnerProps
          />
        );
      } else {
        return this._createBuilderForCurrentRoute();
      }
    } else {
      return (
        <Router
          key={this.routerKey}
          history={hashHistory}
          routes={this.routes}
        />
      );
    }
  }
}

Preview.propTypes = propTypes;
Preview.defaultProps = defaultProps;
Preview.displayName = 'Preview';

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Preview);
