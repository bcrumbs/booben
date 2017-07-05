'use strict';

import styled, { css } from 'styled-components';
import { transition } from '@reactackle/reactackle';

import {
  baseModule,
  paletteBlueGrey500,
  colorWhite,
  fontSizeXSmall,
} from '../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  background-color: ${paletteBlueGrey500};
  padding: ${baseModule(0.5)}px ${baseModule(1)}px;
  color: ${colorWhite};
  font-size: ${fontSizeXSmall}px;
  line-height: 1.1;
  display: inline-block;
  max-width: 100%;
  max-height: 100%;
`;

TitleStyled.displayName = 'TitleStyled';
