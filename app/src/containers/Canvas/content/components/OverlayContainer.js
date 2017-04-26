/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

const overlayStyle = {
  height: '1px',
  width: '1px',
  left: '0',
  top: '0',
  position: 'absolute',
  zIndex: '999',
};

export const OverlayContainer = ({ children }) => (
  <div style={overlayStyle}>
    {children}
  </div>
);

OverlayContainer.displayName = 'OverlayContainer';