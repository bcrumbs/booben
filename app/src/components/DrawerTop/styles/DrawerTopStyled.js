'use strict';

import styled from 'styled-components';
import { animations } from '../../../styles/mixins';
import {
  colorMain,
  colorMainForeground,
} from '../../../styles/themeSelectors';

export const DrawerTopStyled = styled.div`
  width: 100%;
  min-height: 36px;
  background-color: ${colorMain};
  color: ${colorMainForeground};
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  animation: ${animations.slideInDown} 200ms ease-out;
`;

DrawerTopStyled.displayName = 'DrawerTopStyled';
