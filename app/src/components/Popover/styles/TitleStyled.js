import styled from 'styled-components';

import {
  baseModule,
  fontSizeSmall,
  textColorMedium,
  paletteBlueGrey600,
} from '../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  padding: ${baseModule(0.5)}px ${baseModule(1)}px;
  font-size: ${fontSizeSmall}px;
  color: ${textColorMedium};
  border-bottom: 1px solid ${paletteBlueGrey600};
`;

TitleStyled.displayName = 'TitleStyled';
