'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  type: PropTypes.oneOf(['main', 'aside']),
};

const defaultProps = {
  type: 'main',
};

export const DraggableWindowRegion = props => {
  let className = 'draggable-window-region';
  if (props.type) className += ` draggable-window-region-${props.type}`;

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

DraggableWindowRegion.propTypes = propTypes;
DraggableWindowRegion.defaultProps = defaultProps;
DraggableWindowRegion.displayName = 'DraggableWindowRegion';
