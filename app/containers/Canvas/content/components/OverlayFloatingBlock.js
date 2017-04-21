/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  element: PropTypes.element.isRequired,
};

const defaultProps = {
};

export const OverlayFloatingBlock = props => {
  const { element, children } = props;

  const { left, top } = element.getBoundingClientRect();
  const containerStyle = {
    position: 'absolute',
    zIndex: '1002',
    left: `${left}px`,
    top: `${top}px`,
  };

  return (
    <div style={containerStyle}>
      {children}
    </div>
  );
};

OverlayFloatingBlock.propTypes = propTypes;
OverlayFloatingBlock.defaultProps = defaultProps;
OverlayFloatingBlock.displayName = 'OverlayFloatingBlock';
