'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  text: PropTypes.string,
};

const defaultProps = {
  text: '',
};

const style = {
  position: 'absolute',
  left: '0',
  top: '0',
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'stretch',
  padding: '0',
};

const contentBoxStyle = {
  backgroundColor: '#F4F5FA',
  padding: '24px',
  flexGrow: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const textStyle = {
  color: '#929caf',
  fontSize: '24px',
  maxWidth: '24em',
  userSelect: 'none',
};

export const CanvasPlaceholder = ({ text }) => (
  <div style={style}>
    <div style={contentBoxStyle}>
      <div style={textStyle}>
        {text}
      </div>
    </div>
  </div>
);

CanvasPlaceholder.propTypes = propTypes;
CanvasPlaceholder.defaultProps = defaultProps;
CanvasPlaceholder.displayName = 'CanvasPlaceholder';
