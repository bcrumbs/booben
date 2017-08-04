'use strict';

import styled from 'styled-components';

import {
  baseModule,
  paletteBlueGrey600,
} from '../../../styles/themeSelectors';

export const CanvasFrameStyled = styled.section`
  flex-grow: 1;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  background-color: ${paletteBlueGrey600};
  padding: ${baseModule(1)}px;
  box-sizing: border-box;
  flex-direction: column;
`;

CanvasFrameStyled.displayName = 'CanvasFrameStyled';
