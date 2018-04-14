import React from 'react';

const overlayStyle = {
  height: '1px',
  width: '1px',
  left: '0',
  top: '0',
  position: 'absolute',
  zIndex: '999',
  fontFamily: 'Open Sans, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif',
};

export const OverlayContainer = ({ children }) => (
  <div style={overlayStyle}>
    {children}
  </div>
);

OverlayContainer.displayName = 'OverlayContainer';
