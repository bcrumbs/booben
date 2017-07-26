'use strict';

import React from 'react';
import { ToolBarGroupStyled } from './styles/ToolBarGroupStyled';

export const ToolBarGroup = ({ children }) => (
  <ToolBarGroupStyled>
    {children}
  </ToolBarGroupStyled>
);

ToolBarGroup.displayName = 'ToolBarGroup';
