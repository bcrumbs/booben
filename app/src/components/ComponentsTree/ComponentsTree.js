import React from 'react';
import { ComponentsTreeStyled } from './styles/ComponentsTreeStyled';

export const ComponentsTree = props => (
  <ComponentsTreeStyled>
    {props.children}
  </ComponentsTreeStyled>
);

ComponentsTree.displayName = 'ComponentsTree';

export * from './ComponentsTreeList/ComponentsTreeList';
export * from './ComponentsTreeItem/ComponentsTreeItem';
export * from './ComponentsTreeCursor/ComponentsTreeCursor';
