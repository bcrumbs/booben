import React from 'react';
import { DrawerTopStyled } from './styles/DrawerTopStyled';
import { DrawerTopContentStyled } from './styles/DrawerTopContentStyled';

export const DrawerTop = props => (
  <DrawerTopStyled>
    <DrawerTopContentStyled>
      {props.children}
    </DrawerTopContentStyled>
  </DrawerTopStyled>
);

DrawerTop.displayName = 'DrawerTop';
