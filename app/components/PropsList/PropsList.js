/**
 * @author Ekaterina Marova
 */

'use strict';

import React from 'react';
import './PropsList.scss';

export const PropsList = props => (
  <div className="props-list">
    {props.children}
  </div>
);

PropsList.displayName = 'PropsList';

export * from './PropsItem/PropsItem';
