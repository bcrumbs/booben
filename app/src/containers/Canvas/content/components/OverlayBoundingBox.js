/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  element: PropTypes.element,
  color: PropTypes.string,
};

const contextTypes = {
  window: PropTypes.object.isRequired,
};

const defaultProps = {
  element: null,
  color: 'grey',
};

export const OverlayBoundingBox = (props, context) => {
  const { element, color } = props;
  const { window } = context;
  
  if (!element) return null;

  let { left, top, width, height } = element.getBoundingClientRect();
  if (!width || !height) return null;

  const syntheticPadding = -2;
  const scrollTop = window.pageYOffset;

  width = width + syntheticPadding + 0.5;
  height = height + syntheticPadding + 0.5;
  left = Math.round(left - syntheticPadding / 2 - 1);
  top = Math.round(top - syntheticPadding / 2 + scrollTop - 1);

  const border = `1px solid ${color}`;

  const style = {
    height: '1px',
    width: '1px',
    position: 'absolute',
    zIndex: '1000',
    left: `${left}px`,
    top: `${top}px`,
    boxSizing: 'border-box',
  };

  const topBorderStyle = {
    height: '0',
    width: `${width}px`,
    left: '0',
    top: '0',
    borderBottom: border,
    position: 'absolute',
    boxSizing: 'border-box',
  };

  const bottomLeftStyle = {
    height: `${height}px`,
    width: '0',
    left: '0',
    top: '0',
    borderRight: border,
    position: 'absolute',
    boxSizing: 'border-box',
  };

  const bottomBottomStyle = {
    height: '0',
    width: `${width}px`,
    left: '0',
    bottom: `${-height}px`,
    borderTop: border,
    position: 'absolute',
    boxSizing: 'border-box',
  };

  const bottomRightStyle = {
    height,
    width: '0',
    right: `${-width}px`,
    top: '0',
    borderLeft: border,
    position: 'absolute',
    boxSizing: 'border-box',
  };

  return (
    <div style={style}>
      <div style={topBorderStyle} />
      <div style={bottomLeftStyle} />
      <div style={bottomBottomStyle} />
      <div style={bottomRightStyle} />
    </div>
  );
};

OverlayBoundingBox.propTypes = propTypes;
OverlayBoundingBox.contextTypes = contextTypes;
OverlayBoundingBox.defaultProps = defaultProps;
OverlayBoundingBox.displayName = 'OverlayBoundingBox';
