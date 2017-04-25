'use strict';

import React from 'react';
import './ComponentLayoutSelection.scss';

export const ComponentLayoutSelection = ({ children }) => (
  <div className="component-layout-selection-wrapper">
    <div className="component-layout-selection-list">
      {children}
    </div>
  </div>
);

ComponentLayoutSelection.displayName = 'ComponentLayoutSelection';

export * from './ComponentLayoutSelectionItem/ComponentLayoutSelectionItem';
