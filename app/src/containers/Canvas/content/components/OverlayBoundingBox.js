/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  element: PropTypes.object,
  color: PropTypes.string,
};

const contextTypes = {
  window: PropTypes.object.isRequired,
};

const defaultProps = {
  element: null,
  color: 'grey',
};

const BORDER_WIDTH = 2;

export const OverlayBoundingBox = (props, context) => {
  const { element, color } = props;
  const { window } = context;
  
  if (!element) return null;

  const { left, top, width, height } = element.getBoundingClientRect();
  if (!width || !height) return null;
  
  const scrollTop = window.pageYOffset;
  const topValue = Math.round(top + scrollTop);

  const style = {
    height: 0,
    width: 0,
    position: 'absolute',
    zIndex: '1000',
    left: `${left}px`,
    top: `${topValue}px`,
    boxSizing: 'border-box',
  };
  
  const commonBorderStyles = {
    position: 'absolute',
    boxSizing: 'border-box',
    backgroundColor: color,
  };

  const topBorderStyle = {
    ...commonBorderStyles,
  
    width,
    height: `${BORDER_WIDTH}px`,
    left: '0',
    top: '0',
  };

  const leftBorderStyle = {
    ...commonBorderStyles,
    
    height,
    width: `${BORDER_WIDTH}px`,
    left: '0',
    top: '0',
  };

  const bottomBorderStyle = {
    ...commonBorderStyles,
  
    width,
    height: `${BORDER_WIDTH}px`,
    left: '0',
    bottom: `-${Math.round(height)}px`,
  };

  const rightBorderStyle = {
    ...commonBorderStyles,
    
    height,
    width: `${BORDER_WIDTH}px`,
    right: `-${width}px`,
    top: '0',
  };

  return (
    <div style={style}>
      <div style={topBorderStyle} />
      <div style={leftBorderStyle} />
      <div style={bottomBorderStyle} />
      <div style={rightBorderStyle} />
    </div>
  );
};

OverlayBoundingBox.propTypes = propTypes;
OverlayBoundingBox.contextTypes = contextTypes;
OverlayBoundingBox.defaultProps = defaultProps;
OverlayBoundingBox.displayName = 'OverlayBoundingBox';
