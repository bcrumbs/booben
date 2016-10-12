'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Set } from 'immutable';
import { connect } from 'react-redux';

let container = null;

const getContainer = () =>
    container || (container = document.getElementById('container'));

class Overlay extends Component {
    _getDOMElementByComponentId(id) {
        return getContainer().querySelector(`[data-jssy-id="${id}"]`);
    }

    _getItems(componentIds, color, zIndex) {
        return componentIds.map(id => {
            const el = this._getDOMElementByComponentId(id);
            if (!el) return null;

            let {
                left,
                top,
                width,
                height
            } = el.getBoundingClientRect();

            const syntheticPadding = 10,
                scrollTop = window.pageYOffset;

            width = width + syntheticPadding;
            height = height + syntheticPadding;
            left = left - syntheticPadding/2;
            top = top - syntheticPadding/2 + scrollTop;

            const borderColorSelect = `3px solid ${color}`,
                style = {
                    height: '1px',
                    width: '1px',
                    position: 'absolute',
                    zIndex: zIndex || 1000,
                    left: left,
                    top: top
                },
                topBorder = {
                    height: '0px',
                    width: width,
                    left: 0,
                    top: 0,
                    borderTop: borderColorSelect,
                    position: 'absolute'
                },
                bottomLeft = {
                    height: height,
                    width: '0px',
                    left: 0,
                    top: 0,
                    borderLeft: borderColorSelect,
                    position: 'absolute'
                },
                bottomBottom = {
                    height: '0px',
                    width: width,
                    left: 0,
                    bottom: -height,
                    borderBottom: borderColorSelect,
                    position: 'absolute'
                },
                bottomRight = {
                    height: height,
                    width: '0px',
                    right: -width,
                    top: '0px',
                    borderRight: borderColorSelect,
                    position: 'absolute'
                };

            return (
                <div key={id} style={style}>
                    <div style={topBorder}></div>
                    <div style={bottomLeft}></div>
                    <div style={bottomBottom}></div>
                    <div style={bottomRight}></div>
                </div>
            );
        });
    }

    render() {
        const overlayStyle = {
            height: '1px',
            width: '1px',
            left: 0,
            top: 0,
            position: 'absolute',
            zIndex: 999,
        };

        const highlightBoxes = this.props.highlightingEnabled
            ? this._getItems(this.props.highlightedComponentIds, 'yellow')
            : null;

        const selectBoxes = this._getItems(this.props.selectedComponentIds, 'green');

        const rootComponentBox = this.props.boundaryComponentId !== null
            ? this._getItems(Set([this.props.boundaryComponentId]), 'red')
            : null;

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
    selectedComponentIds: ImmutablePropTypes.set,
    highlightedComponentIds: ImmutablePropTypes.set,
    boundaryComponentId: PropTypes.any,
    highlightingEnabled: PropTypes.bool
};

const mapStateToProps = state => ({
    selectedComponentIds: state.preview.selectedItems,
    highlightedComponentIds: state.preview.highlightedItems,
    boundaryComponentId: state.preview.boundaryComponentId,
    highlightingEnabled: state.preview.highlightingEnabled
});

export default connect(
    mapStateToProps
)(Overlay);
