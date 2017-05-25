'use strict';

import React, { Component } from 'react';
import { DrawerTopStyled } from './styles/DrawerTopStyled';

export const DrawerTop = props => (
  <DrawerTopStyled>
    {props.children}
  </DrawerTopStyled>
);

DrawerTop.displayName = 'DrawerTop';
