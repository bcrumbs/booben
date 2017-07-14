'use strict';

import styled from 'styled-components';
import { TitleStyled } from './TitleStyled';

import {
  baseModule,
  fontSizeBody,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const TypeStyled = styled.div`
  font-size: ${fontSizeBody}px;
  line-height: 1.25;
  color: ${textColorMedium};

  ${TitleStyled} + & {
      margin-top: ${baseModule(1)}px;
  }
`;

TypeStyled.displayName = 'TypeStyled';
