'use strict';

import styled from 'styled-components';
import { RouteCardStyled } from '../RouteCard/styles/RouteCardStyled';
import { baseModule, colorBorder } from '../../../styles/themeSelectors';

export const RoutesListStyled = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style-type: none;
  position: relative;
  
  ${RouteCardStyled} & {    
    margin-left: ${baseModule(2)}px;
    margin-top: ${baseModule(1)}px;
    
    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: -${baseModule(1)}px;
      width: 1px;
      height: 100%;
      background-color: ${colorBorder};
    }
  }
  
  ${RouteCardStyled} & ${RouteCardStyled} {
    margin-bottom: ${baseModule(2)}px;
  }
`;

RoutesListStyled.displayName = 'RoutesListStyled';
