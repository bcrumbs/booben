'use strict';

import './DraggableWindow.scss';
import React, { PropTypes } from 'react';

export const DraggableWindow = props => {
    let className = 'draggable-window';

    if (props.isDragged) className += ' is-dragged';

    const style = {
        position: 'absolute'
    };

    return (
        <div className={className} style={style}>
            {props.children}
        </div>
    );
};

DraggableWindow.propTypes = {
	isDragged: PropTypes.bool
};

DraggableWindow.defaultProps = {
	isDragged: false
};

DraggableWindow.displayName = 'DraggableWindow';

export * from './DraggableWindowRegion/DraggableWindowRegion';
