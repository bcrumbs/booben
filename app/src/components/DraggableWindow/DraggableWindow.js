'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils/misc';
import { DraggableWindowStyled } from './styles/DraggableWindowStyled';

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

export const DraggableWindow = props => (
  <DraggableWindowStyled
    maxHeight={props.maxHeight > 0 ? props.maxHeight : DEFAULT_MAX_HEIGHT}
    minWidth={props.minWidth > 0 ? props.minWidth : null}
    zIndex={props.zIndex}
    dragged={props.isDragged}
    onMouseDown={props.onFocus}
  >
    {props.children}
  </DraggableWindowStyled>
);

DraggableWindow.propTypes = propTypes;
DraggableWindow.defaultProps = defaultProps;
DraggableWindow.displayName = 'DraggableWindow';

export * from './DraggableWindowRegion/DraggableWindowRegion';
