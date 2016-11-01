'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Set } from 'immutable';
import { connect } from 'react-redux';

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
     * @param {number} componentId
     * @param {string} color
     * @param {number} zIndex
     * @return {ReactElement}
     * @private
     */
    _renderBoundingBox(componentId, color, zIndex) {
        const el = this._getDOMElementByComponentId(componentId);
        if (!el) return null;

        let {
            left,
            top,
            width,
            height
        } = el.getBoundingClientRect();

        const syntheticPadding = -2,
            scrollTop = window.pageYOffset;

        width = width + syntheticPadding + 1;
        height = height + syntheticPadding + 1;
        left = Math.round(left - syntheticPadding / 2 - 1);
        top = Math.round(top - syntheticPadding / 2 + scrollTop - 1);

        const border = `2px solid ${color}`;

        const style = {
            height: '1px',
            width: '1px',
            position: 'absolute',
            zIndex: String(zIndex),
            left: `${left}px`,
            top: `${top}px`
        };

        const topBorderStyle = {
            height: '0',
            width: `${width}px`,
            left: '0',
            top: '0',
            borderTop: border,
            position: 'absolute',
            opacity: '.5'
        };

        const bottomLeftStyle = {
            height: `${height}px`,
            width: '0',
            left: '0',
            top: '0',
            borderLeft: border,
            position: 'absolute',
            opacity: '.5'
        };

        const bottomBottomStyle = {
            height: '0',
            width: `${width}px`,
            left: '0',
            bottom: `${-height}px`,
            borderBottom: border,
            position: 'absolute',
            opacity: '.5'
        };

        const bottomRightStyle = {
            height: height,
            width: '0',
            right: `${-width}px`,
            top: '0',
            borderRight: border,
            position: 'absolute',
            opacity: '.5'
        };

        const key = `bbox-${componentId}-color`;

        //noinspection JSValidateTypes
        return (
            <div key={key} style={style}>
                <div style={topBorderStyle}></div>
                <div style={bottomLeftStyle}></div>
                <div style={bottomBottomStyle}></div>
                <div style={bottomRightStyle}></div>
            </div>
        );
    }

    /**
     *
     * @param {Immutable.List<number>} componentIds
     * @param {string} color
     * @param {number} [zIndex=1000]
     * @return {Immutable.List<ReactElement>}
     * @private
     */
    _renderBoundingBoxes(componentIds, color, zIndex = 1000) {
        //noinspection JSValidateTypes
        return componentIds.map(id => this._renderBoundingBox(id, color, zIndex));
    }

    render() {
        const overlayStyle = {
            height: '1px',
            width: '1px',
            left: '0',
            top: '0',
            position: 'absolute',
            zIndex: '999',
        };

        const highlightBoxes = this.props.highlightingEnabled
            ? this._renderBoundingBoxes(this.props.highlightedComponentIds, 'yellow')
            : null;

        const selectBoxes =
            this._renderBoundingBoxes(this.props.selectedComponentIds, 'green');

        let rootComponentBox = null;
        if (this.props.draggingComponent) {
            const currentRoute = this.props.project.routes.get(this.props.currentRouteId);

            const boundaryComponentId = this.props.currentRouteIsIndexRoute
                ? currentRoute.indexComponent
                : currentRoute.component;

            if (boundaryComponentId > -1) {
                rootComponentBox = this._renderBoundingBoxes(
                    Set([boundaryComponentId]),
                    'red'
                );
            }
        }

        return (
            <div style={overlayStyle}>
                {highlightBoxes}
                {selectBoxes}
                {rootComponentBox}
            </div>
        );
    }
}

Overlay.propTypes = {
    project: PropTypes.any,
    selectedComponentIds: ImmutablePropTypes.set,
    highlightedComponentIds: ImmutablePropTypes.set,
    highlightingEnabled: PropTypes.bool,
    draggingComponent: PropTypes.bool,
    currentRouteId: PropTypes.number,
    currentRouteIsIndexRoute: PropTypes.bool
};

const mapStateToProps = state => ({
    project: state.project.data,
    selectedComponentIds: state.project.selectedItems,
    highlightedComponentIds: state.project.highlightedItems,
    highlightingEnabled: state.project.highlightingEnabled,
    draggingComponent: state.project.draggingComponent,
    currentRouteId: state.project.currentRouteId,
    currentRouteIsIndexRoute: state.project.currentRouteIsIndexRoute
});

export default connect(
    mapStateToProps
)(Overlay);
