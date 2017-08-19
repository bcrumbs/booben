'use strict';

import styled from 'styled-components';
import constants from './constants';

import {
  colorWhite,
  paletteBlueGrey600,
  bodyFontFamily,
  fontSizeBody,
} from '../../../styles/themeSelectors';

export const PanelCollapsibleStyled = styled.div`
  background-color: ${paletteBlueGrey600};
  border: 1px solid ${constants.borderColor};
  color: ${colorWhite};
  width: 100%;
  font-size: ${fontSizeBody}px;
  font-family: ${bodyFontFamily};
`;

PanelCollapsibleStyled.displayName = 'PanelCollapsibleStyled';
