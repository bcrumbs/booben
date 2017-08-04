/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

const style = {
  width: '100%',
  height: '100%',
  minHeight: '30px',
  minWidth: '30px',
  flexGrow: '1',
  backgroundColor: 'rgba(0, 113, 216, 0.2)',
  border: '1px solid #fff',
  boxSizing: 'border-box',
};

export const ContentPlaceholder = () => (
  <div style={style} />
);

ContentPlaceholder.displayName = 'ContentPlaceholder';
