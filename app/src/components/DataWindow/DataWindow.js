/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import { DataWindowStyled } from './styles/DataWindowStyled';

export const DataWindow = props => (
  <DataWindowStyled>
    {props.children}
  </DataWindowStyled>
);

DataWindow.displayName = 'DataWindow';

export * from './DataWindowTitle/DataWindowTitle';
export * from './DataWindowHeadingButtons/DataWindowHeadingButtons';
export * from './DataWindowContentGroup/DataWindowContentGroup';
