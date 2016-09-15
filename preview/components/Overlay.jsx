'use strict';

import React, { Component, PropTypes } from 'react';

class Overlay extends Component {
    _getSelectItems() {
        let items = [];

        this.props.selected.forEach((item) => {
            let {
                bottom,
                height,
                left,
                right,
                top,
                width
            } = item.el.getBoundingClientRect();

            const syntheticPadding = 10,
                scrollTop = window.pageYOffset,
                uid = item.uid;

            width = width + syntheticPadding;
            height = height + syntheticPadding;
            left = left - syntheticPadding/2;
            top = top - syntheticPadding/2 + scrollTop;

            const borderColorSelect = '3px solid green',
                style = {
                    height: '1px',
                    width: '1px',
                    position: 'absolute',
                    zIndex: 1000,
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

            items.push(
                <div key={uid} style={style}>
                    <div style={topBorder}></div>
                    <div style={bottomLeft}></div>
                    <div style={bottomBottom}></div>
                    <div style={bottomRight}></div>
                </div>
            );
        });

        const overlayStyle = {
            height: '1px',
            width: '1px',
            left: 0,
            top: 0,
            position: 'absolute',
            zIndex: 999,
        }

        return <div style={overlayStyle}>
            {items}
        </div>;
    }

    render() {
        return this._getSelectItems();
    }
}

export default Overlay;