'use strict';

import React from 'react';
import { MenuOverlappingGroupHeadingStyled }
  from './styles/MenuOverlappingGroupHeadingStyled';

export const MenuOverlappingGroupHeading = props => (
  <MenuOverlappingGroupHeadingStyled>
    {props.children}
  </MenuOverlappingGroupHeadingStyled>
);

MenuOverlappingGroupHeading.displayName = 'MenuOverlappingGroupHeading';

