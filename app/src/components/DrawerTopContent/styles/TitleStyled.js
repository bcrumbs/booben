'use strict';

import styled from 'styled-components';
import {
  fontSizeSmall,
  baseModule,
} from '../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  margin-right: ${baseModule(1)}px;
  padding: ${baseModule(0.5)}px 0;
`;

TitleStyled.displayName = 'TitleStyled';
