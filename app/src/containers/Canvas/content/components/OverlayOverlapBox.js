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
  color: '#ECEFF7',
};

export const OverlayOverlapBox = (props, context) => {
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

  const overlayElementStyle = {
    left,
    top,
    width,
    height,
    background: color,
    opacity: 0.7,
    pointerEvents: 'none',
  };
  
  return (
    <div style={style}>
      <div style={overlayElementStyle} />
    </div>
  );
};

OverlayOverlapBox.propTypes = propTypes;
OverlayOverlapBox.contextTypes = contextTypes;
OverlayOverlapBox.defaultProps = defaultProps;
OverlayOverlapBox.displayName = 'OverlayOverlapBox';
