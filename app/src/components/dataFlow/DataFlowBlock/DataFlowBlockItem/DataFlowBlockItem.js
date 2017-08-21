import React from 'react';
import { ItemStyled } from './styles/ItemStyled';

export const DataFlowBlockItem = props => (
  <ItemStyled>
    {props.children}
  </ItemStyled>
);

DataFlowBlockItem.displayName = 'DataFlowBlockItem';

export * from './NodeView/NodeView';
export * from './PickView/PickView';
export * from './TableView/TableView';
export * from './GraphQLGroup/GraphQLGroup';
export * from './ArrayGroup/ArrayGroup';
