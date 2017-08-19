'use strict';

import styled from 'styled-components';

import {
  paletteBlueGrey100,
  fontSizeSmall,
  fontWeightSemibold,
} from '../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  color: ${paletteBlueGrey100};
  font-size: ${fontSizeSmall}px;
  font-weight: ${fontWeightSemibold};
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

TitleStyled.displayName = 'TitleStyled';
