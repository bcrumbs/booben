/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

export const OverlayBoundingBox = props => {
  if (!props.element) return null;

  let {
        left,
        top,
        width,
        height,
    } = props.element.getBoundingClientRect();

  const syntheticPadding = -2,
    scrollTop = window.pageYOffset;

  width = width + syntheticPadding + 0.5;
  height = height + syntheticPadding + 0.5;
  left = Math.round(left - syntheticPadding / 2 - 1);
  top = Math.round(top - syntheticPadding / 2 + scrollTop - 1);

  const border = `1px solid ${props.color}`;

  const style = {
    height: '1px',
    width: '1px',
    position: 'absolute',
    zIndex: '9999',
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

    // noinspection JSValidateTypes
  return (
    <div style={style}>
      <div style={topBorderStyle} />
      <div style={bottomLeftStyle} />
      <div style={bottomBottomStyle} />
      <div style={bottomRightStyle} />
    </div>
  );
};

OverlayBoundingBox.propTypes = {
  element: PropTypes.any, // DOM element actually
  color: PropTypes.string,
};

OverlayBoundingBox.defaultProps = {
  element: null,
  color: 'grey',
};

OverlayBoundingBox.displayName = 'OverlayBoundingBox';
