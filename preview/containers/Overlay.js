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
    currentRootComponentIdSelector
} from '../../app/selectors';

import { OverlayContainer } from '../components/OverlayContainer';
import { OverlayBoundingBox } from '../components/OverlayBoundingBox';
import { OverlayComponentTitle } from '../components/OverlayComponentTitle';

import { PREVIEW_DOM_CONTAINER_ID } from '../../common/shared-constants';

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

class Overlay extends PureComponent {
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

    _renderTitles() {
        // TODO: Handle cases when multiple titles appear in the same place
        return this.props.components.map(component => (
            <OverlayComponentTitle
                key={component.id}
                element={this._getDOMElementByComponentId(component.id)}
                title={component.title || component.name}
            />
        ));
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

Overlay.propTypes = {
    components: ImmutablePropTypes.map,
    rootComponentId: PropTypes.number,
    selectedComponentIds: ImmutablePropTypes.set,
    highlightedComponentIds: ImmutablePropTypes.set,
    boundaryComponentId: PropTypes.number,
    highlightingEnabled: PropTypes.bool,
    draggingComponent: PropTypes.bool,
    showComponentTitles: PropTypes.bool
};

const mapStateToProps = state => ({
    components: currentComponentsSelector(state),
    rootComponentId: currentRootComponentIdSelector(state),
    selectedComponentIds: currentSelectedComponentIdsSelector(state),
    highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
    boundaryComponentId: currentRootComponentIdSelector(state),
    highlightingEnabled: state.project.highlightingEnabled,
    draggingComponent: state.project.draggingComponent,
    showComponentTitles: state.app.showComponentTitles
});

export default connect(
    mapStateToProps
)(Overlay);
