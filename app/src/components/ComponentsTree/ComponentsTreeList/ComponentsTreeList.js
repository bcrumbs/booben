import React from 'react';
import { TreeListStyled } from './styles/TreeListStyled';

export const ComponentsTreeList = ({ children }) => (
  <TreeListStyled>
    {children}
  </TreeListStyled>
);

ComponentsTreeList.displayName = 'ComponentsTreeList';
