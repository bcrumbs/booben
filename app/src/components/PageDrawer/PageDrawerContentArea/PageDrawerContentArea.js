'use strict';

import React from 'react';

export const PageDrawerContentArea = props => (
  <div className="page-drawer-content">
    {props.children}
  </div>
);

PageDrawerContentArea.displayName = 'PageDrawerContentArea';
