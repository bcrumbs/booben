'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Set } from 'immutable';
import { connect } from 'react-redux';

import {
  currentSelectedComponentIdsSelector,
  currentHighlightedComponentIdsSelector,
  currentRootComponentIdSelector,
  currentComponentsSelector,
} from '../../app/selectors';

import { OverlayContainer } from '../components/OverlayContainer';
import { OverlayBoundingBox } from '../components/OverlayBoundingBox';
import { OverlayComponentTitle } from '../components/OverlayComponentTitle';
import { PREVIEW_DOM_CONTAINER_ID } from '../../shared/constants';

//noinspection JSUnresolvedVariable
const propTypes = {
  components: ImmutablePropTypes.map.isRequired,
  selectedComponentIds: ImmutablePropTypes.set.isRequired,
  highlightedComponentIds: ImmutablePropTypes.set.isRequired,
  boundaryComponentId: PropTypes.number.isRequired,
  highlightingEnabled: PropTypes.bool.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  showComponentTitles: PropTypes.bool.isRequired,
};

const HIGHLIGHT_COLOR = 'rgba(0, 113, 216, 0.3)';
const SELECT_COLOR = 'rgba(0, 113, 216, 1)';
const BOUNDARY_COLOR = 'red';

/**
 *
 * @type {?HTMLElement}
 */
let container = null;

/**
 *
 * @return {HTMLElement}
 */
const getContainer = () =>
  container || (container = document.getElementById(PREVIEW_DOM_CONTAINER_ID));

/**
 *
 * @param {number} id
 * @return {HTMLElement}
 * @private
 */
const getDOMElementByComponentId = id =>
  getContainer().querySelector(`[data-jssy-id="${id}"]`) || null;

class Overlay extends PureComponent {
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
      const element = getDOMElementByComponentId(id),
        key = `${id}-${color}`;

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
    // TODO: Handle cases when multiple titles appear in the same place

    //noinspection JSValidateTypes
    return this.props.components.valueSeq().map(component => {
      const element = getDOMElementByComponentId(component.id),
        title = component.title || component.name;

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
    const highlightBoxes = this.props.highlightingEnabled
      ? this._renderBoundingBoxes(
        this.props.highlightedComponentIds,
        HIGHLIGHT_COLOR,
      )
      : null;

    const selectBoxes =
      this._renderBoundingBoxes(this.props.selectedComponentIds, SELECT_COLOR);

    let rootComponentBox = null;
    if (this.props.draggingComponent && this.props.boundaryComponentId > -1) {
      rootComponentBox = this._renderBoundingBoxes(
        Set([this.props.boundaryComponentId]),
        BOUNDARY_COLOR,
      );
    }

    const titles = this.props.showComponentTitles
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
Overlay.displayName = 'Overlay';

const mapStateToProps = state => ({
  components: currentComponentsSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
  boundaryComponentId: currentRootComponentIdSelector(state),
  highlightingEnabled: state.project.highlightingEnabled,
  draggingComponent: state.project.draggingComponent,
  showComponentTitles: state.app.showComponentTitles,
});

export default connect(mapStateToProps)(Overlay);
