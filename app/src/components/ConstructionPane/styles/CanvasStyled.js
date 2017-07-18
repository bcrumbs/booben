'use strict';

import styled from 'styled-components';
import componentConstants from './constants';
import { paletteBlueGrey100 } from '../../../styles/themeSelectors';

const hasRulers = ({ rulers }) => rulers
  ? `
    max-height: calc(100% - ${componentConstants}px);
    max-width: calc(100% - ${componentConstants}px);
    top: ${componentConstants}px;
    left: ${componentConstants}px;
  `
  : '';

export const CanvasStyled = styled.div`
  background-color: ${paletteBlueGrey100};
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  ${hasRulers}
`;

CanvasStyled.displayName = 'CanvasStyled';
