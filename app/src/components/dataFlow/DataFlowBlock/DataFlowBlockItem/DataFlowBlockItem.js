import React from 'react';
import { ItemStyled } from './styles/ItemStyled';

export const DataFlowBlockItem = props => (
  <ItemStyled>
    {props.children}
  </ItemStyled>
);

DataFlowBlockItem.displayName = 'DataFlowBlockItem';

export * from './views/NodeView/NodeView';
export * from './views/PickView/PickView';
