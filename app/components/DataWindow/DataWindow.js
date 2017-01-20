/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

export const DataWindow = props => (
  <div className="data-window_content">
    {props.children}
  </div>
);

DataWindow.displayName = 'DataWindow';

export * from './DataWindowTitle/DataWindowTitle';
export * from './DataWindowHeadingButtons/DataWindowHeadingButtons';
