'use strict';

import styled from 'styled-components';

import {
  quarterBaseModule,
  fontSizeSmall,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const RouteParameterStyled = styled.li`
  margin: 0;
  padding: 0;
  list-style-type: none;
  font-size: ${fontSizeSmall}px;
  line-height: 1.5;
  color: ${textColorMedium};
  
  & + & {
    margin-top: ${quarterBaseModule}px;
  }
`;

RouteParameterStyled.displayName = 'RouteParameterStyled';
