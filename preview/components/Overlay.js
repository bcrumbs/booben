'use strict';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Set } from 'immutable';
import { connect } from 'react-redux';

import { componentsMap, domElementsMap } from '../utils';

class Overlay extends Component {
    _getItems(uids, color, zIndex) {
        if(!uids.size) return;

        return uids.map((uid) => {
            const el = domElementsMap.get(uid);

            let {
                bottom,
                height,
                left,
                right,
                top,
                width
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
                <div key={uid} style={style}>
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
        }

        return (
            <div style={overlayStyle}>
                { this._getItems(this.props.highlighted, 'yellow') }
                { this._getItems(this.props.selected, 'green') }
                { this.props.workspaceVisible &&
                    this._getItems(this.props.workspace, 'red') }
            </div>
        );
    }
}

Overlay.propTypes = {
    selected: ImmutablePropTypes.set,
    highlighted: ImmutablePropTypes.set,
    workspace: ImmutablePropTypes.set,
    workspaceVisible: PropTypes.bool
};

Overlay.defaultProps = {
    selected: Set(),
    highlighted: Set(),
    workspace: Set(),
    workspaceVisible: false
};

const mapStateToProps = state => ({
    selected: state.preview.selectedItems,
    highlighted: state.preview.highlightedItems,
    workspace: state.preview.workspace,
    workspaceVisible: state.preview.workspaceVisible
});

export default connect(
    mapStateToProps
)(Overlay);
