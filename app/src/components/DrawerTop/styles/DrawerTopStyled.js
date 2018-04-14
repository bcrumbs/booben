import styled from 'styled-components';
import { animations } from '../../../styles/mixins';
import {
  colorMain,
  colorMainForeground,
} from '../../../styles/themeSelectors';

import constants from './constants';

export const DrawerTopStyled = styled.div`
  width: 100%;
  min-height: ${constants.minHeight};
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  background-color: ${colorMain};
  color: ${colorMainForeground};
  animation: ${animations.slideInDown} 200ms ease-out;
`;

DrawerTopStyled.displayName = 'DrawerTopStyled';
