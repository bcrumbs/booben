'use strict';

import styled from 'styled-components';

import {
  fontSizeSmall,
  paletteBlueGrey700,
} from '../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  line-height: 1.4;
  color: ${paletteBlueGrey700};
  text-align: left;
`;

TitleStyled.displayName = 'TitleStyled';
