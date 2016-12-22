'use strict';

import './PropsList.scss';
import React from 'react';

export const PropsList = props => (
  <div className="props-list">
    {props.children}
  </div>
);

PropsList.displayName = 'PropsList';

export * from './PropsItem/PropsItem';
