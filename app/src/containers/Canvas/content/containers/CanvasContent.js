import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import throttle from 'lodash.throttle';
import kdbush from 'kdbush';
import _minBy from 'lodash.minby';
import { CanvasBuilder } from '../../../builders/CanvasBuilder/CanvasBuilder';

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
  pickComponentDataCancel,
  ComponentPickAreas,
} from '../../../../actions/project';

import {
  topNestedConstructorSelector,
  currentComponentsSelector,
} from '../../../../selectors';

import Project, { getComponentById } from '../../../../models/Project';
import { getRouteParams } from '../../../../models/ProjectRoute';
import { formatComponentTitle } from '../../../../lib/components';
import ComponentsBundle from '../../../../lib/ComponentsBundle';
import { distance } from '../../../../utils/geometry';
import { noop, waitFor } from '../../../../utils/misc';
import { CANVAS_CONTAINER_ID } from '../constants';
import { INVALID_ID } from '../../../../constants/misc';
import * as BoobenPropTypes from '../../../../constants/common-prop-types';
import { DND_CANVAS_SNAP_LINES } from '../../../../config';

const propTypes = {
  componentsBundle: PropTypes.instanceOf(ComponentsBundle).isRequired,
  project: PropTypes.instanceOf(Project).isRequired,
  currentComponents: BoobenPropTypes.components.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  draggingOverPlaceholder: PropTypes.bool.isRequired,
  placeholderContainerId: PropTypes.number.isRequired,
  placeholderAfter: PropTypes.number.isRequired,
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentData: PropTypes.bool.isRequired,
  pickingComponentFilter: PropTypes.func,
  componentDataListIsVisible: PropTypes.bool.isRequired,
  highlightingEnabled: PropTypes.bool.isRequired,
  currentRouteId: PropTypes.number.isRequired,
  currentRouteIsIndexRoute: PropTypes.bool.isRequired,
  topNestedConstructor: PropTypes.any,
  onToggleComponentSelection: PropTypes.func.isRequired,
  onSelectSingleComponent: PropTypes.func.isRequired,
  onHighlightComponent: PropTypes.func.isRequired,
  onUnhighlightComponent: PropTypes.func.isRequired,
  onPickComponent: PropTypes.func.isRequired,
  onCancelPickComponentData: PropTypes.func.isRequired,
  onDragOverPlaceholder: PropTypes.func.isRequired,
  onDragOverNothing: PropTypes.func.isRequired,
  onDropZoneSnap: PropTypes.func,
  onDropZoneUnsnap: PropTypes.func,
  onDropZoneUpdateSnapPoints: PropTypes.func,
  onDropZoneOpenDropMenu: PropTypes.func,
};

const contextTypes = {
  window: PropTypes.object.isRequired,
  document: PropTypes.object.isRequired,
};

const defaultProps = {
  topNestedConstructor: null,
  pickingComponentFilter: null,
  onDropZoneSnap: noop,
  onDropZoneUnsnap: noop,
  onDropZoneUpdateSnapPoints: noop,
  onDropZoneOpenDropMenu: noop,
};

const mapStateToProps = state => ({
  project: state.project.data,
  currentComponents: currentComponentsSelector(state),
  draggingComponent: state.project.draggingComponent,
  draggingOverPlaceholder: state.project.draggingOverPlaceholder,
  placeholderContainerId: state.project.placeholderContainerId,
  placeholderAfter: state.project.placeholderAfter,
  pickingComponent: state.project.pickingComponent,
  pickingComponentData: state.project.pickingComponentData,
  pickingComponentFilter: state.project.pickingComponentFilter,
  componentDataListIsVisible: state.project.componentDataListIsVisible,
  highlightingEnabled: state.project.highlightingEnabled,
  currentRouteId: state.project.currentRouteId,
  currentRouteIsIndexRoute: state.project.currentRouteIsIndexRoute,
  topNestedConstructor: topNestedConstructorSelector(state),
});

const mapDispatchToProps = dispatch => ({
  onToggleComponentSelection: componentId =>
    void dispatch(toggleComponentSelection(componentId)),

  onSelectSingleComponent: componentId =>
    void dispatch(selectPreviewComponent(componentId, true, true, true)),

  onHighlightComponent: componentId =>
    void dispatch(highlightPreviewComponent(componentId)),

  onUnhighlightComponent: componentId =>
    void dispatch(unhighlightPreviewComponent(componentId)),

  onPickComponent: componentId =>
    void dispatch(pickComponentDone(componentId, ComponentPickAreas.CANVAS)),

  onCancelPickComponentData: () =>
    void dispatch(pickComponentDataCancel()),

  onDragOverPlaceholder: (containerId, afterIdx) =>
    void dispatch(dragOverPlaceholder(containerId, afterIdx)),

  onDragOverNothing: () =>
    void dispatch(dragOverNothing()),
});

const wrap = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
);

const SNAP_DISTANCE = 200;
const SUPPRESS_DROP_MENU_RADIUS = Math.round(SNAP_DISTANCE * 1.5);
const CLOSE_SNAP_POINTS_THRESHOLD = 10;
const DRAG_THROTTLE = 100;

const readContainerId = element =>
  parseInt(element.getAttribute('data-booben-container-id'), 10);

const readAfterIdx = element =>
  parseInt(element.getAttribute('data-booben-after'), 10);

const getOutletPosition = components => {
  const outlet = components.find(component => component.name === 'Outlet');

  if (!outlet || outlet.parentId === INVALID_ID) {
    return {
      containerId: INVALID_ID,
      afterIdx: -1,
    };
  }

  const parent = components.get(outlet.parentId);
  const outletPosition = parent.children.keyOf(outlet.id);

  return {
    containerId: parent.id,
    afterIdx: outletPosition - 1,
  };
};

const findPlaceholders = async document => {
  let placeholders = [];

  await waitFor(() => {
    placeholders = document.querySelectorAll('[data-booben-placeholder]');
    return placeholders.length > 0;
  }, 10, 10);

  return placeholders;
};

class CanvasContent extends Component {
  constructor(props, context) {
    super(props, context);

    this._container = null;
    this._unhighilightTimer = -1;
    this._unhighlightedComponentId = INVALID_ID;
    this._draggingOverCanvas = false;
    this._lastDropMenuSnapPoint = { x: 0, y: 0 };
    this._suppressDropMenu = false;
    this._snapPoints = null;
    this._snapPointsIndex = null;

    this._handleMouseOver = this._handleMouseOver.bind(this);
    this._handleMouseOut = this._handleMouseOut.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._handleBodyClick = this._handleBodyClick.bind(this);
    this._handleNavigate = this._handleNavigate.bind(this);
    this._handleOpenURL = this._handleOpenURL.bind(this);

    this.drag = throttle(this.drag.bind(this), DRAG_THROTTLE);
  }

  componentDidMount() {
    const containerNode = this._getContainer();
    containerNode.addEventListener('mouseover', this._handleMouseOver, false);
    containerNode.addEventListener('mouseout', this._handleMouseOut, false);
    containerNode.addEventListener('click', this._handleClick, false);
  }

  componentWillReceiveProps(nextProps) {
    const { pickingComponent, pickingComponentData } = this.props;

    const nowPickingComponent =
      nextProps.pickingComponent ||
      nextProps.pickingComponentData;

    const wasPickingComponent =
      pickingComponent ||
      pickingComponentData;

    if (nowPickingComponent) {
      if (!wasPickingComponent) {
        window.document.body.addEventListener('click', this._handleBodyClick);
      }
    } else if (wasPickingComponent) {
      window.document.body.removeEventListener('click', this._handleBodyClick);
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

    if (this._draggingOverCanvas) {
      if (draggingOverPlaceholder) {
        const selector =
          '[data-booben-placeholder]' +
          `[data-booben-container-id="${placeholderContainerId}"]` +
          `[data-booben-after="${placeholderAfter}"]`;

        const placeholderElement = document.querySelector(selector);

        if (placeholderElement) {
          onDropZoneSnap({ element: placeholderElement });
        } else {
          onDropZoneUnsnap();
        }
      } else {
        onDropZoneUnsnap();
      }
    }
  }

  componentWillUnmount() {
    const { pickingComponent, pickingComponentData } = this.props;
    const { window } = this.context;

    const containerNode = this._getContainer();

    containerNode.removeEventListener(
      'mouseover',
      this._handleMouseOver,
      false,
    );

    containerNode.removeEventListener('mouseout', this._handleMouseOut, false);

    containerNode.removeEventListener('click', this._handleClick, false);

    if (pickingComponent || pickingComponentData) {
      window.document.body.removeEventListener('click', this._handleBodyClick);
    }
  }

  /**
   * Called by Canvas component
   */
  async enter() {
    const { onDropZoneUpdateSnapPoints } = this.props;

    this._draggingOverCanvas = true;

    if (DND_CANVAS_SNAP_LINES) {
      const snapPoints = await this._getAllSnapPoints();

      if (this._draggingOverCanvas && snapPoints.length > 1) {
        onDropZoneUpdateSnapPoints(snapPoints);
      }
    }
  }

  /**
   * Called by Canvas component
   */
  leave() {
    this._draggingOverCanvas = false;
    this._snap(null);
  }

  /**
   * @typedef {Object} SnapPoint
   * @property {number} containerId
   * @property {number} afterIdx
   * @property {number} [x]
   * @property {number} [y]
   */

  /**
   *
   * @return {Array<SnapPoint>}
   * @private
   */
  async _getAllSnapPoints() {
    const { document } = this.context;

    if (this._snapPoints !== null) {
      return this._snapPoints;
    }

    const placeholders = await findPlaceholders(document);
    let ret;

    if (placeholders.length === 0) {
      ret = [];
    } else if (placeholders.length === 1) {
      const element = placeholders[0];

      // We don't need coordinates if there's only one snap point
      ret = [{
        containerId: readContainerId(element),
        afterIdx: readAfterIdx(element),
      }];
    } else {
      ret = [];
      placeholders.forEach(element => {
        const { left, top } = element.getBoundingClientRect();

        ret.push({
          x: Math.round(left),
          y: Math.round(top),
          containerId: readContainerId(element),
          afterIdx: readAfterIdx(element),
        });
      });
    }

    this._snapPoints = ret;

    return ret;
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @return {{ all: Array<SnapPoint>, snappable: Array<SnapPoint> }}
   * @private
   */
  async _getPossibleSnapPoints(x, y) {
    const snapPoints = await this._getAllSnapPoints();
    let possibleSnapPoints;

    if (snapPoints.length < 2) {
      possibleSnapPoints = snapPoints;
    } else {
      if (this._snapPointsIndex === null) {
        this._snapPointsIndex = kdbush(
          snapPoints,
          p => p.x,
          p => p.y,
          64,
          Int32Array,
        );
      }

      const pointsWithinSnapDistance = this._snapPointsIndex
        .within(x, y, SNAP_DISTANCE)
        .map(id => snapPoints[id]);

      if (pointsWithinSnapDistance.length > 0) {
        const closestPoint = _minBy(
          pointsWithinSnapDistance,
          point => distance(x, y, point.x, point.y),
        );

        possibleSnapPoints = this._snapPointsIndex
          .within(closestPoint.x, closestPoint.y, CLOSE_SNAP_POINTS_THRESHOLD)
          .map(id => snapPoints[id]);
      } else {
        possibleSnapPoints = [];
      }
    }

    return possibleSnapPoints;
  }

  /**
   * Called by Canvas component
   *
   * @param {number} x
   * @param {number} y
   * @private
   */
  async drag({ x, y }) {
    const {
      currentComponents,
      draggingComponent,
      onDropZoneOpenDropMenu,
    } = this.props;

    if (!draggingComponent) return;

    // Although ComponentsDragArea doesn't call onDrag after onLeave,
    // this method can be called later because it's throttled,
    // so we need to check if we're still here
    if (!this._draggingOverCanvas) return;

    if (this._suppressDropMenu) {
      const distanceToLastSnapPoint = distance(
        x,
        y,
        this._lastDropMenuSnapPoint.x,
        this._lastDropMenuSnapPoint.y,
      );

      if (distanceToLastSnapPoint >= SUPPRESS_DROP_MENU_RADIUS) {
        this._suppressDropMenu = false;
      }
    }

    const possibleSnapPoints = await this._getPossibleSnapPoints(x, y);

    // _getPossibleSnapPoints is async, check if we're still here
    if (!this._draggingOverCanvas) return;

    if (possibleSnapPoints.length === 0) {
      this._snap(null);
      return;
    }

    if (possibleSnapPoints.length === 1) {
      this._snap(possibleSnapPoints[0]);
      return;
    }

    const dropPointsData = possibleSnapPoints.map(snapPoint => {
      const container = currentComponents.get(snapPoint.containerId);
      const parentNames = [];

      let componentId = container.parentId;
      let i = 0;

      while (componentId !== INVALID_ID && i < 2) {
        const component = currentComponents.get(componentId);
        parentNames.unshift(formatComponentTitle(component));
        componentId = component.parentId;
        i++;
      }

      const ellipsis = componentId !== INVALID_ID;
      const title = formatComponentTitle(container);
      const caption =
        `${ellipsis ? '... ' : ''}${parentNames.join(' > ')} >`;

      return {
        title,
        caption,
        data: snapPoint,
      };
    });

    onDropZoneOpenDropMenu({
      coords: { x, y },
      snapCoords: {
        x: possibleSnapPoints[0].x,
        y: possibleSnapPoints[0].y,
      },
      dropPointsData,
    });

    this._lastDropMenuSnapPoint = {
      x: possibleSnapPoints[0].x,
      y: possibleSnapPoints[0].y,
    };

    this._suppressDropMenu = true;
  }

  /**
   * Called by Canvas component
   * @param {SnapPoint} snapPoint
   */
  dropMenuItemSelected(snapPoint) {
    this._snap(snapPoint);
  }

  /**
   * Called by Canvas component
   */
  dropMenuClosed() {
    this._snap(null);
  }

  /**
   * Called by Canvas component
   */
  drop() {
    this._snapPoints = null;
    this._snapPointsIndex = null;
  }

  /**
   *
   * @param {SnapPoint} snapPoint
   * @private
   */
  _snap(snapPoint) {
    const {
      draggingOverPlaceholder,
      placeholderContainerId,
      placeholderAfter,
      onDragOverPlaceholder,
      onDragOverNothing,
    } = this.props;

    if (snapPoint === null) {
      if (draggingOverPlaceholder) onDragOverNothing();
    } else {
      const willUpdatePlaceholder =
        !draggingOverPlaceholder ||
        placeholderContainerId !== snapPoint.containerId ||
        placeholderAfter !== snapPoint.afterIdx;

      if (willUpdatePlaceholder) {
        onDragOverPlaceholder(snapPoint.containerId, snapPoint.afterIdx);
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

    if (this._container === null) {
      this._container = document.getElementById(CANVAS_CONTAINER_ID);
    }

    return this._container;
  }

  /**
   *
   * @param {HTMLElement} element
   * @return {number}
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

      const dataBoobenId = current.getAttribute('data-booben-id');
      if (dataBoobenId) return parseInt(dataBoobenId, 10);
      if (current.hasAttribute('data-reactroot')) break;
      current = current.parentNode;
    }

    return INVALID_ID;
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

    return component && component.routeId === currentRouteId &&
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
        if (this._unhighlightedComponentId !== componentId) {
          if (this._unhighlightedComponentId !== INVALID_ID) {
            onUnhighlightComponent(this._unhighlightedComponentId);
          }

          if (pickingComponent) {
            if (
              !pickingComponentFilter ||
              pickingComponentFilter(componentId)
            ) {
              onHighlightComponent(componentId);
            }
          } else {
            onHighlightComponent(componentId);
            this._unhighlightedComponentId = componentId;
          }
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
      const componentId = this._getClosestComponentId(event.target);

      if (
        componentId !== INVALID_ID &&
        this._canInteractWithComponent(componentId)
      ) {
        onUnhighlightComponent(this._unhighlightedComponentId);

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
      componentDataListIsVisible,
      onToggleComponentSelection,
      onSelectSingleComponent,
      onPickComponent,
      onCancelPickComponentData,
    } = this.props;

    if (event.button === 0) { // Left button
      if (componentDataListIsVisible) {
        onCancelPickComponentData();
        return;
      }

      const componentId = this._getClosestComponentId(event.target);

      if (
        componentId !== INVALID_ID &&
        this._canInteractWithComponent(componentId)
      ) {
        if (pickingComponent) {
          if (!pickingComponentFilter || pickingComponentFilter(componentId)) {
            onPickComponent(componentId);
          }
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
   * @param {MouseEvent} event
   * @private
   */
  _handleBodyClick(event) {
    const {
      componentDataListIsVisible,
      onCancelPickComponentData,
    } = this.props;

    // Ignore events that were re-dispatched from the iframe manually
    if (event.target.tagName === 'IFRAME') return;

    if (componentDataListIsVisible) {
      onCancelPickComponentData();
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

    this._history.push(path);
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
    const {
      project,
      currentRouteId,
      currentRouteIsIndexRoute,
      componentsBundle,
    } = this.props;

    if (currentRouteId === INVALID_ID) return null;

    let route = project.routes.get(currentRouteId);
    let ret;

    const routeParams = getRouteParams(route, project.routes);

    if (currentRouteIsIndexRoute) {
      const outletPosition = getOutletPosition(route.components);

      ret = (
        <CanvasBuilder
          componentsBundle={componentsBundle}
          components={route.components}
          rootId={route.component}
          routeParams={routeParams}
        >
          <CanvasBuilder
            editable
            componentsBundle={componentsBundle}
            components={route.components}
            rootId={route.indexComponent}
            routeParams={routeParams}
            enclosingComponents={route.components}
            enclosingContainerId={outletPosition.containerId}
            enclosingAfterIdx={outletPosition.afterIdx}
          />
        </CanvasBuilder>
      );
    } else {
      let enclosingComponents = null;
      let enclosingContainerId = INVALID_ID;
      let enclosingAfterIdx = -1;

      if (route.parentId !== INVALID_ID) {
        const parentRoute = project.routes.get(route.parentId);
        const outletPosition = getOutletPosition(parentRoute.components);

        enclosingComponents = parentRoute.components;
        enclosingContainerId = outletPosition.containerId;
        enclosingAfterIdx = outletPosition.afterIdx;
      }

      ret = (
        <CanvasBuilder
          editable
          componentsBundle={componentsBundle}
          components={route.components}
          rootId={route.component}
          routeParams={routeParams}
          enclosingComponents={enclosingComponents}
          enclosingContainerId={enclosingContainerId}
          enclosingAfterIdx={enclosingAfterIdx}
        />
      );
    }

    while (route.parentId !== INVALID_ID) {
      route = project.routes.get(route.parentId);

      const routeParams = getRouteParams(route, project.routes);

      ret = (
        <CanvasBuilder
          componentsBundle={componentsBundle}
          components={route.components}
          rootId={route.component}
          routeParams={routeParams}
        >
          {ret}
        </CanvasBuilder>
      );
    }

    return ret;
  }

  _renderTopNestedConstructor() {
    const {
      project,
      topNestedConstructor,
      currentRouteId,
      componentsBundle,
    } = this.props;

    const currentRoute = project.routes.get(currentRouteId);
    const routeParams = getRouteParams(currentRoute, project.routes);

    return (
      <CanvasBuilder
        editable
        componentsBundle={componentsBundle}
        components={topNestedConstructor.components}
        rootId={topNestedConstructor.rootId}
        routeParams={routeParams}
      />
    );
  }

  render() {
    const { topNestedConstructor } = this.props;

    return topNestedConstructor
      ? this._renderTopNestedConstructor()
      : this._renderCurrentRoute();
  }
}

CanvasContent.propTypes = propTypes;
CanvasContent.contextTypes = contextTypes;
CanvasContent.defaultProps = defaultProps;
CanvasContent.displayName = 'CanvasContent';

export default wrap(CanvasContent);
