'use strict';

import React from 'react';

import './PropSourcePicker.scss';

export const PropSourcePicker = props => (
  <div className="source-picker">
    {props.children}
  </div>
);

PropSourcePicker.displayName = 'PropSourcePicker';

export * from './SourceDivider/SourceDivider';
export * from './SourceGroup/SourceGroup';
