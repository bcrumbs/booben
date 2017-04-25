'use strict';

import React from 'react';
import './DataList.scss';

export const DataList = ({ children }) => (
  <div className="data-list">
    {children}
  </div>
);

DataList.displayName = 'DataList';

export * from './DataItem/DataItem';
