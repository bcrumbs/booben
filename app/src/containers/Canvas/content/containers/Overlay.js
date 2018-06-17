import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Set } from 'immutable';
import { connect } from 'react-redux';

import {
  selectedComponentIdsSelector,
  highlightedComponentIdsSelector,
  disabledComponentIdsSelector,
  currentRootComponentIdSelector,
  currentComponentsSelector,
  isCanvasClearSelector,
  getLocalizedTextFromState,
  currentRouteSelector,
} from '../../../../selectors';

import { OverlayContainer } from '../components/OverlayContainer';
import { OverlayBoundingBox } from '../components/OverlayBoundingBox';
import { OverlayOverlapBox } from '../components/OverlayOverlapBox';
import { CanvasPlaceholder } from '../components/CanvasPlaceholder';
import { formatComponentTitle, findComponent } from '../../../../lib/components';
import { mapListToArray } from '../../../../utils/misc';
import { CANVAS_CONTAINER_ID } from '../constants';
import { INVALID_ID } from '../../../../constants/misc';
import * as BoobenPropTypes from '../../../../constants/common-prop-types';

import ProjectRoute from '../../../../models/ProjectRoute';
import Project from '../../../../models/Project';

const propTypes = {
  project: PropTypes.instanceOf(Project).isRequired,
  components: BoobenPropTypes.components.isRequired,
  selectedComponentIds: BoobenPropTypes.setOfIds.isRequired,
  highlightedComponentIds: BoobenPropTypes.setOfIds.isRequired,
  disabledComponentIds: BoobenPropTypes.setOfIds.isRequired,
  boundaryComponentId: PropTypes.number.isRequired,
  highlightingEnabled: PropTypes.bool.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentData: PropTypes.bool.isRequired,
  isCanvasClear: PropTypes.bool.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  currentRoute: PropTypes.instanceOf(ProjectRoute),
};

const defaultProps = {
  currentRoute: INVALID_ID,
};

const contextTypes = {
  document: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  project: state.project.data,
  components: currentComponentsSelector(state),
  selectedComponentIds: selectedComponentIdsSelector(state),
  highlightedComponentIds: highlightedComponentIdsSelector(state),
  disabledComponentIds: disabledComponentIdsSelector(state),
  boundaryComponentId: currentRootComponentIdSelector(state),
  highlightingEnabled: state.project.highlightingEnabled,
  draggingComponent: state.project.draggingComponent,
  pickingComponent: state.project.pickingComponent,
  pickingComponentData: state.project.pickingComponentData,
  isCanvasClear: isCanvasClearSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
  currentRoute: currentRouteSelector(state),
});

const wrap = connect(mapStateToProps);

const HIGHLIGHT_COLOR = 'rgba(0, 113, 216, 0.7)';
const HIGHLIGHT_STYLE = 'dashed';
const SELECT_COLOR = 'rgba(0, 113, 216, 1)';
const SELECT_STYLE = 'solid';
const BOUNDARY_COLOR = 'red';
const BOUNDARY_STYLE = 'solid';

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

class Overlay extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._container = null;
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
   * @param {number} id
   * @return {?HTMLElement}
   * @private
   */
  _getDOMElementByComponentId(id) {
    const container = this._getContainer();
    return container.querySelector(`[data-booben-id="${id}"]`) || null;
  }

  /**
   *
   * @param {Immutable.List<number>} componentIds
   * @param {string} color
   * @param {string} borderStyle
   * @param {boolean} [showTitle=false]
   * @param {number} [additionalOverlayLevel=0]
   * @return {Array<ReactElement>}
   * @private
   */
  _renderBoundingBoxes(
    componentIds,
    color,
    borderStyle,
    showTitle = false,
    additionalOverlayLevel = 0,
  ) {
    const { components } = this.props;

    return mapListToArray(componentIds, id => {
      const element = this._getDOMElementByComponentId(id);
      const key = `${id}-${color}`;
      let title = '';

      if (showTitle) {
        const component = components.get(id);
        if (component) {
          title = formatComponentTitle(component);
        }
      }

      return (
        <OverlayBoundingBox
          key={key}
          element={element}
          color={color}
          borderStyle={borderStyle}
          title={title}
          showTitle={showTitle}
          additionalOverlayLevel={additionalOverlayLevel}
        />
      );
    });
  }

  /**
   *
   * @param {Immutable.List<number>} componentIds
   * @return {Array<ReactElement>}
   * @private
   */
  _renderOverlapBoxes(componentIds) {
    return mapListToArray(componentIds, id => {
      const element = this._getDOMElementByComponentId(id);
      return (
        <OverlayOverlapBox key={`overlap-${id}`} element={element} />
      );
    });
  }

  render() {
    const {
      project,
      draggingComponent,
      pickingComponent,
      pickingComponentData,
      highlightingEnabled,
      highlightedComponentIds,
      disabledComponentIds,
      selectedComponentIds,
      boundaryComponentId,
      isCanvasClear,
      getLocalizedText,
      currentRoute,
    } = this.props;

    const disabledBoxes = disabledComponentIds.isEmpty()
      ? null
      : this._renderOverlapBoxes(
        disabledComponentIds,
      );

    const highlightBoxes = highlightingEnabled
      ? this._renderBoundingBoxes(
        highlightedComponentIds,
        HIGHLIGHT_COLOR,
        HIGHLIGHT_STYLE,
        true,
        1,
      )
      : null;

    const selectBoxes = pickingComponent || pickingComponentData
      ? null
      : this._renderBoundingBoxes(
        selectedComponentIds,
        SELECT_COLOR,
        SELECT_STYLE,
        true,
      );

    const willRenderBoundaryBox =
      boundaryComponentId !== INVALID_ID && (
        pickingComponent ||
        pickingComponentData ||
        draggingComponent
      );

    const rootComponentBox = willRenderBoundaryBox
      ? this._renderBoundingBoxes(
        Set([boundaryComponentId]),
        BOUNDARY_COLOR,
        BOUNDARY_STYLE,
      )
      : null;

    let canvasPlaceholder = null;

    if (currentRoute && currentRoute.parentId !== INVALID_ID) {
      const parentHasOutlet = isRouteEditable(
        project.routes,
        currentRoute.id,
        currentRoute.haveIndex,
      );

      if (!parentHasOutlet) {
        canvasPlaceholder = (
          <CanvasPlaceholder
            key="canvas_placeholder"
            text={getLocalizedText('design.canvas.placeholderNoParentRouteOutlet')}
          />
        );
      }
    }
    if (isCanvasClear && !draggingComponent) {
      canvasPlaceholder = (
        <CanvasPlaceholder
          key="canvas_placeholder"
          text={getLocalizedText('design.canvas.placeholder')}
        />
      );
    }

    return (
      <OverlayContainer>
        {disabledBoxes}
        {highlightBoxes}
        {selectBoxes}
        {rootComponentBox}
        {canvasPlaceholder}
      </OverlayContainer>
    );
  }
}

Overlay.propTypes = propTypes;
Overlay.defaultProps = defaultProps;
Overlay.contextTypes = contextTypes;
Overlay.displayName = 'Overlay';

export default wrap(Overlay);
