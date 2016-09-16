'use strict';

import './DraggableWindow.scss';
import React, { PropTypes } from 'react';

export const DraggableWindow = props => {
    let className = 'draggable-window';
    if (props.isDragged) className += ' is-dragged';

    const style = {
        position: 'absolute'
    };

    if (props.maxHeight > 0) style.maxHeight = `${props.maxHeight}px`;

    return (
        <div className={className} style={style}>
            {props.children}
        </div>
    );
};

DraggableWindow.propTypes = {
    isDragged: PropTypes.bool,
    maxHeight: PropTypes.number
};

DraggableWindow.defaultProps = {
    isDragged: false,
    maxHeight: 0
};

DraggableWindow.displayName = 'DraggableWindow';

export * from './DraggableWindowRegion/DraggableWindowRegion';
