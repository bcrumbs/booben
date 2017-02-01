/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

// TODO: Style me

const style = {
  width: '100%',
  minHeight: '20px',
  backgroundColor: 'gray',
  boxSizing: 'border-box',
};

export const Outlet = () => (
  <div style={style}>
    Outlet (style me!)
  </div>
);

Outlet.displayName = 'Outlet';
