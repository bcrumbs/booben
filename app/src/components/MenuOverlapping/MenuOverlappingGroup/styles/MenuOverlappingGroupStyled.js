'use strict';

import styled from 'styled-components';

import {
  baseModule,
  paletteBlueGrey100,
} from '../../../../styles/themeSelectors';

export const MenuOverlappingGroupStyled = styled.div`
  padding: ${baseModule}px 0;

  & + & {
      border-top: 1px solid ${paletteBlueGrey100};
  }
`;

MenuOverlappingGroupStyled.displayName = 'MenuOverlappingGroupStyled';
