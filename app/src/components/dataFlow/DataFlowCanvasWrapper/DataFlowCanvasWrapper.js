import React from 'react';

import {
  DataFlowCanvasWrapperStyled,
} from './styles/DataFlowCanvasWrapperStyled';

export const DataFlowCanvasWrapper = props => (
  <DataFlowCanvasWrapperStyled>
    {props.children}
  </DataFlowCanvasWrapperStyled>
);

DataFlowCanvasWrapper.displayName = 'DataFlowCanvasWrapper';
