'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Set } from 'immutable';
import { connect } from 'react-redux';

import {
  selectedComponentIdsSelector,
  highlightedComponentIdsSelector,
  currentRootComponentIdSelector,
  currentComponentsSelector,
  getLocalizedTextFromState,
} from '../../../../selectors';

import { OverlayContainer } from '../components/OverlayContainer';
import { OverlayBoundingBox } from '../components/OverlayBoundingBox';
import { CanvasPlaceholder } from '../components/CanvasPlaceholder';
import { formatComponentTitle } from '../../../../lib/components';
import { mapListToArray } from '../../../../utils/misc';
import { CANVAS_CONTAINER_ID } from '../constants';
import { INVALID_ID } from '../../../../constants/misc';
import * as JssyPropTypes from '../../../../constants/common-prop-types';

const propTypes = {
  components: JssyPropTypes.components.isRequired,
  selectedComponentIds: JssyPropTypes.setOfIds.isRequired,
  highlightedComponentIds: JssyPropTypes.setOfIds.isRequired,
  boundaryComponentId: PropTypes.number.isRequired,
  highlightingEnabled: PropTypes.bool.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  pickingComponent: PropTypes.bool.isRequired,
  pickingComponentStateSlot: PropTypes.bool.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
};

const contextTypes = {
  document: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  components: currentComponentsSelector(state),
  selectedComponentIds: selectedComponentIdsSelector(state),
  highlightedComponentIds: highlightedComponentIdsSelector(state),
  boundaryComponentId: currentRootComponentIdSelector(state),
  highlightingEnabled: state.project.highlightingEnabled,
  draggingComponent: state.project.draggingComponent,
  pickingComponent: state.project.pickingComponent,
  pickingComponentStateSlot: state.project.pickingComponentStateSlot,
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

const HIGHLIGHT_COLOR = 'rgba(0, 113, 216, 0.3)';
const SELECT_COLOR = 'rgba(0, 113, 216, 1)';
const BOUNDARY_COLOR = 'red';

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
    return container.querySelector(`[data-jssy-id="${id}"]`) || null;
  }
  
  /**
   *
   * @param {Immutable.List<number>} componentIds
   * @param {string} color
   * @param {boolean} [showTitle=false]
   * @return {Array<ReactElement>}
   * @private
   */
  _renderBoundingBoxes(componentIds, color, showTitle = false) {
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
          title={title}
          showTitle={showTitle}
        />
      );
    });
  }

  render() {
    const {
      components,
      draggingComponent,
      pickingComponent,
      pickingComponentStateSlot,
      highlightingEnabled,
      highlightedComponentIds,
      selectedComponentIds,
      boundaryComponentId,
      getLocalizedText,
    } = this.props;
    
    const highlightBoxes = highlightingEnabled
      ? this._renderBoundingBoxes(
        highlightedComponentIds,
        HIGHLIGHT_COLOR,
        true,
      )
      : null;

    const selectBoxes = pickingComponent || pickingComponentStateSlot
      ? null
      : this._renderBoundingBoxes(selectedComponentIds, SELECT_COLOR);
    
    const willRenderBoundaryBox =
      boundaryComponentId !== INVALID_ID && (
        pickingComponent ||
        pickingComponentStateSlot ||
        draggingComponent
      );
  
    const rootComponentBox = willRenderBoundaryBox
      ? this._renderBoundingBoxes(
        Set([boundaryComponentId]),
        BOUNDARY_COLOR,
      )
      : null;
    
    let canvasPlaceholder = null;
    if (components.size === 0 && !draggingComponent) {
      canvasPlaceholder = (
        <CanvasPlaceholder
          key="canvas_placeholder"
          text={getLocalizedText('design.canvas.placeholder')}
        />
      );
    }

    return (
      <OverlayContainer>
        {highlightBoxes}
        {selectBoxes}
        {rootComponentBox}
        {canvasPlaceholder}
      </OverlayContainer>
    );
  }
}

Overlay.propTypes = propTypes;
Overlay.contextTypes = contextTypes;
Overlay.displayName = 'Overlay';

export default wrap(Overlay);
