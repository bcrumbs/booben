import React from 'react';
import { CanvasStyled } from './styles/CanvasStyled';

export const DataFlowCanvas = props => (
  <CanvasStyled>
    {props.children}
  </CanvasStyled>
);

DataFlowCanvas.displayName = 'DataFlowCanvas';
