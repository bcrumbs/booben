'use strict';

import React from 'react';

export const ComponentTagWrapper = props => (
  <div className="component-tags-wrapper">
    {props.children}
  </div>
);

ComponentTagWrapper.displayName = 'ComponentTagWrapper';
