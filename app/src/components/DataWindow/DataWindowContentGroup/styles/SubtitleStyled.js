'use strict';

import styled from 'styled-components';
import { TitleStyled } from './TitleStyled';

import {
  baseModule,
  fontSizeSmall,
  textColorMedium,
  fontWeightNormal,
} from '../../../../styles/themeSelectors';

export const SubtitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  color: ${textColorMedium};
  font-weight: ${fontWeightNormal};
  margin-top: ${baseModule(3)}px;
  margin-bottom: ${baseModule(1)}px;
  user-select: none;

  ${TitleStyled} + & {
    margin-top: -${baseModule(1)}px;
  }
`;

SubtitleStyled.displayName = 'SubtitleStyled';
