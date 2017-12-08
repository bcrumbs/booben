/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';
import PropTypes from 'prop-types';
import { OverlayComponentTitle } from './OverlayComponentTitle';

const propTypes = {
  element: PropTypes.object,
  color: PropTypes.string,
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  showOverlay: PropTypes.bool,
  additionalOverlayLevel: PropTypes.number,
};

const contextTypes = {
  window: PropTypes.object.isRequired,
};

const defaultProps = {
  element: null,
  color: '#c8e5f6',
  title: '',
  showTitle: false,
  showOverlay: false,
  additionalOverlayLevel: 0,
};

const BORDER_WIDTH = 1;

export const OverlayBoundingBox = (props, context) => {
  const {
    element,
    color,
    borderStyle,
    title,
    showTitle,
    showOverlay,
    additionalOverlayLevel,
  } = props;

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
    zIndex: `${1000 + additionalOverlayLevel}`,
    left: `${left}px`,
    top: `${topValue}px`,
    boxSizing: 'border-box',
    opacity: additionalOverlayLevel ? '1' : '0.6',
  };
  
  const commonBorderStyles = {
    position: 'absolute',
    boxSizing: 'border-box',
    borderWidth: 0,
    borderColor: color,
    borderStyle,
  };

  const topBorderStyle = {
    ...commonBorderStyles,
  
    width,
    height: `${BORDER_WIDTH}px`,
    borderTopWidth: `${BORDER_WIDTH}px`,
    left: '0',
    top: '0',
  };

  const leftBorderStyle = {
    ...commonBorderStyles,
    
    height,
    width: `${BORDER_WIDTH}px`,
    borderLeftWidth: `${BORDER_WIDTH}px`,
    left: '0',
    top: '0',
  };

  const bottomBorderStyle = {
    ...commonBorderStyles,
  
    width,
    height: `${BORDER_WIDTH}px`,
    borderBottomWidth: `${BORDER_WIDTH}px`,
    left: '0',
    bottom: `-${Math.round(height)}px`,
  };

  const rightBorderStyle = {
    ...commonBorderStyles,
    
    height,
    width: `${BORDER_WIDTH}px`,
    borderRightWidth: `${BORDER_WIDTH}px`,
    right: `-${width}px`,
    top: '0',
  };
  
  let titleElement = null;
  if (showTitle) {
    titleElement = (
      <OverlayComponentTitle
        element={element}
        title={title}
      />
    );
  }

  let overlayElement = null;
  if (showOverlay) {
    overlayElement = (
      <div
        style={{
          left,
          top,
          width,
          height,
          background: color,
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />
    );
  }
  
  return (
    <div style={style}>
      {titleElement}
      {overlayElement}
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
