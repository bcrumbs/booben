import styled from 'styled-components';

import {
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
  padding: ${baseModule(0.5)}px ${baseModule(1)}px;
  width: 100%;
`;

MenuOverlappingDividerStyled.displayName = 'MenuOverlappingDividerStyled';
