/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

const GR_SIZE = 10;
const GR_COLOR = 'rgba(255, 255, 255, 0.3)';

const style = {
  width: '100%',
  height: '100%',
  minHeight: '30px',
  minWidth: '30px',
  flexGrow: '1',
  background: `
    repeating-linear-gradient(
      -45deg, transparent,
      transparent ${GR_SIZE / 2}px,
      ${GR_COLOR} ${GR_SIZE / 2}px,
      ${GR_COLOR} ${GR_SIZE}px
    )
  `,
  backgroundColor: 'rgba(0, 113, 216, 0.2)',
  border: '1px solid rgba(0, 113, 216, 0.1)',
  boxSizing: 'border-box',
};

export const ContentPlaceholder = () => (
  <div style={style} />
);

ContentPlaceholder.displayName = 'ContentPlaceholder';
