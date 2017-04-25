'use strict';

import React from 'react';

export const ComponentsTreeList = ({ children }) => (
  <ul className="components-tree-list">
    {children}
  </ul>
);

ComponentsTreeList.displayName = 'ComponentsTreeList';
