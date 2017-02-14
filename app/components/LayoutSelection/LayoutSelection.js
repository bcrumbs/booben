'use strict';

import React from 'react';
import './LayoutSelection.scss';

export const LayoutSelection = props => (
  <div className="layout-selection-wrapper">
    <div className="layout-selection-list">
      {props.children}
    </div>
  </div>
);

LayoutSelection.displayName = 'LayoutSelection';

export * from './LayoutSelectionItem/LayoutSelectionItem';
