/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

export const DataWindowHeadingButtons = props => (
  <div className="data-window_heading-buttons">
    {props.children}
  </div>
);

DataWindowHeadingButtons.displayName = 'DataWindowHeadingButtons';
