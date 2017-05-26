'use strict';

import styled from 'styled-components';
import {
  fontSizeSmall,
  baseModule,
  halfBaseModule,
} from '../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  margin-right: ${baseModule}px;
  padding: ${halfBaseModule}px 0;
`;

TitleStyled.displayName = 'TitleStyled';
