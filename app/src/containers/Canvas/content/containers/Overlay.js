'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Set } from 'immutable';
import { connect } from 'react-redux';

import {
  currentSelectedComponentIdsSelector,
  currentHighlightedComponentIdsSelector,
  currentRootComponentIdSelector,
  currentComponentsSelector,
} from '../../../../selectors';

import { OverlayContainer } from '../components/OverlayContainer';
import { OverlayBoundingBox } from '../components/OverlayBoundingBox';
import { OverlayComponentTitle } from '../components/OverlayComponentTitle';
import { CANVAS_CONTAINER_ID } from '../constants';
import { INVALID_ID } from '../../../../constants/misc';

const propTypes = {
  components: ImmutablePropTypes.map.isRequired,
  selectedComponentIds: ImmutablePropTypes.set.isRequired,
  highlightedComponentIds: ImmutablePropTypes.set.isRequired,
  boundaryComponentId: PropTypes.number.isRequired,
  highlightingEnabled: PropTypes.bool.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  showComponentTitles: PropTypes.bool.isRequired,
  pickingComponent: PropTypes.bool.isRequired,
};

const contextTypes = {
  document: PropTypes.object.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
  components: currentComponentsSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
  boundaryComponentId: currentRootComponentIdSelector(state),
  highlightingEnabled: state.project.highlightingEnabled,
  draggingComponent: state.project.draggingComponent,
  showComponentTitles: state.app.showComponentTitles,
  pickingComponent: state.project.pickingComponent,
});

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
   * @return {Immutable.List<ReactElement>}
   * @private
   */
  _renderBoundingBoxes(componentIds, color) {
    //noinspection JSValidateTypes
    return componentIds.map(id => {
      const element = this._getDOMElementByComponentId(id);
      const key = `${id}-${color}`;

      return (
        <OverlayBoundingBox
          key={key}
          element={element}
          color={color}
        />
      );
    });
  }

  /**
   *
   * @return {Immutable.Seq<ReactElement>}
   * @private
   */
  _renderTitles() {
    const { components } = this.props;
    
    // TODO: Handle cases when multiple titles appear in the same place

    //noinspection JSValidateTypes
    return components.valueSeq().map(component => {
      const element = this._getDOMElementByComponentId(component.id);
      const title = component.title || component.name;

      return (
        <OverlayComponentTitle
          key={component.id}
          element={element}
          title={title}
        />
      );
    });
  }

  render() {
    const {
      draggingComponent,
      pickingComponent,
      highlightingEnabled,
      showComponentTitles,
      highlightedComponentIds,
      selectedComponentIds,
      boundaryComponentId,
    } = this.props;
    
    const highlightBoxes = highlightingEnabled
      ? this._renderBoundingBoxes(
        highlightedComponentIds,
        HIGHLIGHT_COLOR,
      )
      : null;

    const selectBoxes = pickingComponent
      ? null
      : this._renderBoundingBoxes(selectedComponentIds, SELECT_COLOR);
    
    const willRenderBoundaryBox =
      boundaryComponentId !== INVALID_ID && (
        pickingComponent ||
        draggingComponent
      );
  
    const rootComponentBox = willRenderBoundaryBox
      ? this._renderBoundingBoxes(
        Set([boundaryComponentId]),
        BOUNDARY_COLOR,
      )
      : null;

    const titles = showComponentTitles
      ? this._renderTitles()
      : null;

    return (
      <OverlayContainer>
        {highlightBoxes}
        {selectBoxes}
        {rootComponentBox}
        {titles}
      </OverlayContainer>
    );
  }
}

Overlay.propTypes = propTypes;
Overlay.contextTypes = contextTypes;
Overlay.defaultProps = defaultProps;
Overlay.displayName = 'Overlay';

export default connect(mapStateToProps)(Overlay);
