'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils/misc';
import './DraggableWindow.scss';

const propTypes = {
  isDragged: PropTypes.bool,
  maxHeight: PropTypes.number,
  minWidth: PropTypes.number,
  zIndex: PropTypes.number,
  onFocus: PropTypes.func,
};

const defaultProps = {
  isDragged: false,
  maxHeight: 0,
  minWidth: 0,
  zIndex: 0,
  onFocus: noop,
};

const DEFAULT_MAX_HEIGHT = '80%';

export const DraggableWindow = props => {
  let className = 'draggable-window';
  if (props.isDragged) className += ' is-dragged';

  const style = {
    position: 'absolute',
    zIndex: props.zIndex,
  };

  if (props.maxHeight > 0) style.maxHeight = `${props.maxHeight}px`;
  else style.maxHeight = DEFAULT_MAX_HEIGHT;
  
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

DraggableWindow.propTypes = propTypes;
DraggableWindow.defaultProps = defaultProps;
DraggableWindow.displayName = 'DraggableWindow';

export * from './DraggableWindowRegion/DraggableWindowRegion';
