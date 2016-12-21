'use strict';

import './DraggableWindow.scss';
import React, { PropTypes } from 'react';

export const DraggableWindow = props => {
  let className = 'draggable-window';
  if (props.isDragged) className += ' is-dragged';

  const style = {
    position: 'absolute',
    zIndex: props.zIndex,
  };

  if (props.maxHeight > 0) style.maxHeight = `${props.maxHeight}px`;
  if (props.minWidth > 0) style.minWidth = `${props.minWidth}px`;

  return (
    <div
      className={className}
      style={style}
      onMouseDown={props.onFocus}
    >
      {props.children}
    </div>
  );
};

DraggableWindow.propTypes = {
  isDragged: PropTypes.bool,
  maxHeight: PropTypes.number,
  minWidth: PropTypes.number,
  zIndex: PropTypes.number,
  onFocus: PropTypes.func,
};

DraggableWindow.defaultProps = {
  isDragged: false,
  maxHeight: 0,
  minWidth: 0,
  zIndex: 0,
  onFocus: /* istanbul ignore next */ () => {},
};

DraggableWindow.displayName = 'DraggableWindow';

export * from './DraggableWindowRegion/DraggableWindowRegion';
