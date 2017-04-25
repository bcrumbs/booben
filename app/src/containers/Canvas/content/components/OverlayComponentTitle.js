/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  element: PropTypes.object,
  title: PropTypes.string,
};

const defaultProps = {
  element: null,
  title: '',
};

export const OverlayComponentTitle = props => {
  const { element, title } = props;
  
  if (!element) return null;

  const { left, top, width, height } = element.getBoundingClientRect();
  if (width === 0 || height === 0) return null;

  const style = {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: '1001',
  };

  return (
    <div style={style}>
      {title}
    </div>
  );
};

OverlayComponentTitle.propTypes = propTypes;
OverlayComponentTitle.defaultProps = defaultProps;
OverlayComponentTitle.displayName = 'OverlayComponentTitle';
