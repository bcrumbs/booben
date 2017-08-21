import styled from 'styled-components';
import {
  fontSizeSmall,
  textColorMedium,
  baseModule,
} from '../../../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  color: ${textColorMedium};
  padding: ${baseModule(0.26)}px ${baseModule(1)}px;
`;

TitleStyled.displayName = 'TitleStyled';
