'use strict';

import React from 'react';
import { DrawerTopStyled } from './styles/DrawerTopStyled';
import { DrawerTopContentStyled } from './styles/DrawerTopContentStyled';

export const DrawerTop = ({ fixed, children }) => (
  <DrawerTopStyled>
    <DrawerTopContentStyled>
      {children}
    </DrawerTopContentStyled>
  </DrawerTopStyled>
);

DrawerTop.displayName = 'DrawerTop';
