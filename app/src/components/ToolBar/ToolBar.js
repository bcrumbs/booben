'use strict';

import React from 'react';
import { ToolbarStyled } from './styles/ToolbarStyled';

export const ToolBar = ({ children }) => (
  <ToolbarStyled>
    {children}
  </ToolbarStyled>
);

ToolBar.displayName = 'ToolBar';

export * from './ToolBarGroup/ToolBarGroup';
export * from './ToolBarAction/ToolBarAction';
