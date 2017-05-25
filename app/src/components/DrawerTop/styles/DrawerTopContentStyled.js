'use strict';

import styled from 'styled-components';
import { animations } from '../../../styles/mixins';
import {
  halfBaseModule,
  baseModule,
  colorMain,
  colorMainForeground,
} from '../../../styles/themeSelectors';

export const DrawerTopStyled = styled.div`
  width: 100%;
  min-height: 36px;
  padding: ${halfBaseModule}px ${baseModule}px;
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  background-color: #2196F3;
  background-color: ${colorMain};
  color: ${colorMainForeground};
  animation: ${animations.fadeInDown} 300ms ease-in;
`;

DrawerTopStyled.displayName = 'DrawerTopStyled';
