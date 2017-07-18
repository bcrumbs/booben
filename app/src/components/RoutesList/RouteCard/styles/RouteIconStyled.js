'use strict';

import styled from 'styled-components';
import { iconSize } from '../../../../styles/mixins';

import {
  baseModule,
  paletteBlueGrey600,
} from '../../../../styles/themeSelectors';

export const RouteIconStyled = styled.div`
  margin-left: ${baseModule}px;
  color: ${paletteBlueGrey600};
  ${iconSize('1em', '1em', '0.6em', 'font')}
`;

RouteIconStyled.displayName = 'RouteIconStyled';
