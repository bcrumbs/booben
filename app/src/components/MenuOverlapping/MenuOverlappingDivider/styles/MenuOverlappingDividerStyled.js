'use strict';

import styled from 'styled-components';

import {
  halfBaseModule,
  baseModule,
  paletteBlueGrey100,
  fontSizeXSmall,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const MenuOverlappingDividerStyled = styled.div`
  background-color: ${paletteBlueGrey100};
  color: ${textColorMedium};
  font-size: ${fontSizeXSmall}px;
  line-height: 1.2;
  padding: ${halfBaseModule}px ${baseModule}px;
  width: 100%;
`;

MenuOverlappingDividerStyled.displayName = 'MenuOverlappingDividerStyled';
