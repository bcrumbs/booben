'use strict';

import styled from 'styled-components';
import {
  quaterBaseModule,
  fontSizeSmall,
  fontColorMedium,
} from '../../../../styles/styleHelpers';

export const RouteParameterStyled = styled.li`
  margin: 0;
  padding: 0;
  list-style-type: none;
  font-size: ${fontSizeSmall}px;
  line-height: 1.5;
  color: ${fontColorMedium};
  
  & + & {
    margin-top: ${quaterBaseModule}px;
  }
`;

RouteParameterStyled.displayName = 'RouteParameterStyled';
