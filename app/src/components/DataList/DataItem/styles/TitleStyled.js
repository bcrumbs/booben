'use strict';

import styled from 'styled-components';

import {
  baseModule,
  fontSizeBody,
  textColorBody,
} from '../../../../styles/themeSelectors';

export const TitleStyled = styled.span`
  font-size: ${fontSizeBody}px;
  line-height: 1.5;
  color: ${textColorBody};
  margin-right: ${baseModule(0.5)}px;
`;

TitleStyled.displayName = 'TitleStyled';
