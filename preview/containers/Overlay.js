'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Set } from 'immutable';
import { connect } from 'react-redux';

import {
    currentSelectedComponentIdsSelector,
    currentHighlightedComponentIdsSelector,
    currentRootComponentIdSelector
} from '../../app/selectors';

import { OverlayContainer } from '../components/OverlayContainer';
import { OverlayBoundingBox } from '../components/OverlayBoundingBox';

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
    container || (container = document.getElementById('container'));

class Overlay extends Component {
    /**
     *
     * @param {number} id
     * @return {HTMLElement}
     * @private
     */
    _getDOMElementByComponentId(id) {
        return getContainer().querySelector(`[data-jssy-id="${id}"]`);
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
            const element = this._getDOMElementByComponentId(id) || null,
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

    render() {
        const highlightBoxes = this.props.highlightingEnabled
            ? this._renderBoundingBoxes(this.props.highlightedComponentIds, 'yellow')
            : null;

        const selectBoxes =
            this._renderBoundingBoxes(this.props.selectedComponentIds, 'green');

        let rootComponentBox = null;
        if (this.props.draggingComponent && this.props.boundaryComponentId > -1) {
            rootComponentBox = this._renderBoundingBoxes(
                Set([this.props.boundaryComponentId]),
                'red'
            );
        }

        return (
            <OverlayContainer>
                {highlightBoxes}
                {selectBoxes}
                {rootComponentBox}
            </OverlayContainer>
        );
    }
}

Overlay.propTypes = {
    selectedComponentIds: ImmutablePropTypes.set,
    highlightedComponentIds: ImmutablePropTypes.set,
    boundaryComponentId: PropTypes.number,
    highlightingEnabled: PropTypes.bool,
    draggingComponent: PropTypes.bool
};

const mapStateToProps = state => ({
    selectedComponentIds: currentSelectedComponentIdsSelector(state),
    highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
    boundaryComponentId: currentRootComponentIdSelector(state),
    highlightingEnabled: state.project.highlightingEnabled,
    draggingComponent: state.project.draggingComponent
});

export default connect(
    mapStateToProps
)(Overlay);
