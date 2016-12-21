/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

export const OverlayComponentTitle = props => {
  if (!props.element) return null;

  let {
        left,
        top,
        width,
        height,
    } = props.element.getBoundingClientRect();

  if (width === 0 || height === 0) return null;

  const style = {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: '1001',
  };

  return (
    <div style={style}>
      {props.title}
    </div>
  );
};

OverlayComponentTitle.propTypes = {
  element: PropTypes.any, // DOM element actually
  title: PropTypes.string,
};

OverlayComponentTitle.defaultProps = {
  element: null,
  title: '',
};

OverlayComponentTitle.displayName = 'OverlayComponentTitle';
