/**
 * @author Vladimir Nadygin
 */

import React from 'react';
import { TreeItemStyled } from './styles/TreeItemStyled';

export const ComponentsTreeItem = ({ children }) => (
  <TreeItemStyled>
    {children}
  </TreeItemStyled>
);

ComponentsTreeItem.displayName = 'ComponentsTreeItem';

export * from './ComponentsTreeItemTitle/ComponentsTreeItemTitle';
export * from './ComponentsTreeItemContent/ComponentsTreeItemContent';
