'use strict';

import React, { Component } from 'react';
import { MenuStyled } from './styles/MenuStyled';

export const BlockSelectionMenu = ({ children }) => (
  <MenuStyled>
    {children}
  </MenuStyled>
);

BlockSelectionMenu.displayName = 'BlockSelectionMenu';

export * from './BlockSelectionMenuGroup/BlockSelectionMenuGroup';
export * from './BlockSelectionMenuItem/BlockSelectionMenuItem';
