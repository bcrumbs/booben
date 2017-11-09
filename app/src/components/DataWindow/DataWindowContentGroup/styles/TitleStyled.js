import styled from 'styled-components';

import {
  baseModule,
  fontSizeBody2,
  textColorBody,
  fontWeightSemibold,
} from '../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeBody2}px;
  color: ${textColorBody};
  font-weight: ${fontWeightSemibold};
  margin-top: ${baseModule(3)}px;
  margin-bottom: ${baseModule(1)}px;
  user-select: none;
`;

TitleStyled.displayName = 'TitleStyled';
