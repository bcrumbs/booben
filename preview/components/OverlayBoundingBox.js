/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

export const OverlayBoundingBox = props => {
    if (!props.element) return null;

    let {
        left,
        top,
        width,
        height
    } = props.element.getBoundingClientRect();

    const syntheticPadding = -2,
        scrollTop = window.pageYOffset;

    width = width + syntheticPadding + 1;
    height = height + syntheticPadding + 1;
    left = Math.round(left - syntheticPadding / 2 - 1);
    top = Math.round(top - syntheticPadding / 2 + scrollTop - 1);

    const border = `2px solid ${props.color}`;

    const style = {
        height: '1px',
        width: '1px',
        position: 'absolute',
        zIndex: '1000',
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

    //noinspection JSValidateTypes
    return (
        <div style={style}>
            <div style={topBorderStyle}></div>
            <div style={bottomLeftStyle}></div>
            <div style={bottomBottomStyle}></div>
            <div style={bottomRightStyle}></div>
        </div>
    );
};

OverlayBoundingBox.propTypes = {
    element: PropTypes.any, // DOM element actually
    color: PropTypes.string
};

OverlayBoundingBox.defaultProps = {
    element: null,
    color: 'grey'
};

OverlayBoundingBox.displayName = 'OverlayBoundingBox';
