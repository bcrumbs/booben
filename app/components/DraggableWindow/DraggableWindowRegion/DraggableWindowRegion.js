import React, { PropTypes } from 'react';

export const DraggableWindowRegion = props => {
    let className = `draggable-window-region`;
    if (props.type) className += ' draggable-window-region-' + props.type;

    return (
        <div className={className}>
            {props.children}
        </div>
    );

};

DraggableWindowRegion.propTypes = {
    type: PropTypes.oneOf(['main', 'aside'])
};

DraggableWindowRegion.defaultProps = {
    type: 'main'
};

DraggableWindowRegion.displayName = 'DraggableWindowRegion';
