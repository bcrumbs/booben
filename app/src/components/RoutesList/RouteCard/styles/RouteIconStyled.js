'use strict';

import styled from 'styled-components';
import { iconSize } from '../../../../styles/mixins';
import constants from '../styles/constants';

import {
  baseModule,
  paletteBlueGrey300,
} from '../../../../styles/themeSelectors';

const ICON_SIZE = `${constants.titleLineHeight}em`;

export const RouteIconStyled = styled.div`
  margin-left: ${baseModule(1)}px;
  color: ${paletteBlueGrey300};
  ${iconSize(ICON_SIZE, ICON_SIZE, '1em', 'font')}
`;

RouteIconStyled.displayName = 'RouteIconStyled';
