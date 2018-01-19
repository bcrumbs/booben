import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  element: PropTypes.object,
  title: PropTypes.string,
};

const contextTypes = {
  window: PropTypes.object.isRequired,
};

const defaultProps = {
  element: null,
  title: '',
};

const HEIGHT = 16;

export const OverlayComponentTitle = (props, context) => {
  const { element, title } = props;
  const { window } = context;
  
  let verticalPositionStyle;
  let horizontalPositionStyle;
  
  const { left, top, bottom, width, height } = element.getBoundingClientRect();
  const { innerWidth, innerHeight } = window;
  
  let titlePosition = 'top';
  const flipX = innerWidth - left < 16 + title.length * 6;
  
  if (top < HEIGHT) {
    if (innerHeight - bottom < HEIGHT) {
      titlePosition = 'window';
    } else {
      titlePosition = 'bottom';
    }
  }
  
  if (flipX) {
    horizontalPositionStyle = {
      right: `-${width}px`,
    };
  } else {
    horizontalPositionStyle = {};
  }
  
  if (titlePosition === 'bottom') {
    verticalPositionStyle = {
      top: `${height}px`,
    };
  } else if (titlePosition === 'window') {
    verticalPositionStyle = {
      top: 0,
      position: 'fixed',
    };
  } else {
    verticalPositionStyle = {
      top: 0,
      transform: 'translateY(-100%)',
    };
  }
  
  const titleStyle = {
    ...horizontalPositionStyle,
    ...verticalPositionStyle,
    position: 'absolute',
    backgroundColor: '#c8e5f6',
    color: '#4a5465',
    padding: '2px 8px',
    fontSize: '12px',
    lineHeight: '1.25',
    display: 'block',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  };
  
  return (
    <div style={titleStyle}>
      {title}
    </div>
  );
};

OverlayComponentTitle.propTypes = propTypes;
OverlayComponentTitle.defaultProps = defaultProps;
OverlayComponentTitle.contextTypes = contextTypes;
OverlayComponentTitle.displayName = 'OverlayComponentTitle';
