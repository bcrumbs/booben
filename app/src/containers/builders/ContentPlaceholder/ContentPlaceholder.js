/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';

const GR_SIZE = 10;
const GR_COLOR = 'rgba(0, 113, 216, 0.1)';
const L_COLOR = 'rgba(255, 255, 255, 0.3)';

const style = {
  width: '100%',
  height: '100%',
  minHeight: '50px',
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
  backgroundColor: L_COLOR,
  border: '3px solid #ECEFF7',
  boxShadow: 'inset 0 0 0 2px #fff',
  outline: '1px solid #fff',
  outlineOffset: '-1px',
  boxSizing: 'border-box',
};

export const ContentPlaceholder = () => (
  <div style={style} />
);

ContentPlaceholder.displayName = 'ContentPlaceholder';
