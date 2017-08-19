'use strict';

import styled from 'styled-components';

import {
  baseModule,
  fontSizeSmall,
  textColorMedium,
  fontWeightSemibold,
} from '../../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  width: 100%;
  font-size: ${fontSizeSmall}px;
  color: ${textColorMedium};
  font-weight: ${fontWeightSemibold};
  margin: ${baseModule(1)}px 0 ${baseModule(0.5)}px;
  padding-left: ${baseModule(0.5)}px;
`;

TitleStyled.displayName = 'TitleStyled';
