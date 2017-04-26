'use strict';

import React from 'react';
import './SourceGroupHeading.scss';

export const SourceGroupHeading = props => (
  <div className="source-group_heading">
    {props.children}
  </div>
);

SourceGroupHeading.displayName = 'SourceGroupHeading';

