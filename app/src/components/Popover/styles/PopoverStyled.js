'use strict';

import styled from 'styled-components';

import {
  radiusDefault,
  paletteBlueGrey700,
  paletteBlueGrey25,
  bodyFontFamily,
} from '../../../styles/themeSelectors';

export const PopoverStyled = styled.div`
  width: 100%;
  color: ${paletteBlueGrey25};
  background-color: ${paletteBlueGrey700};
  border-radius: ${radiusDefault}px;
  font-family: ${bodyFontFamily};
  position: absolute;
  z-index: 99;
`;

PopoverStyled.displayName = 'PopoverStyled';
