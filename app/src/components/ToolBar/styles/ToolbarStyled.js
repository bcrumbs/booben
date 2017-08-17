'use strict';

import styled from 'styled-components';
import constants from './constants';
import {
  baseModule,
  paletteBlueGrey600,
  colorWhite,
} from '../../../styles/themeSelectors';

export const ToolbarStyled = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: center;
  background-color: ${paletteBlueGrey600};
  border-bottom: 1px solid ${constants.borderColor};
  padding: 0 ${baseModule(1)}px;
  color: ${colorWhite};
  width: 100%;
  height: ${constants.height}px;
  flex-shrink: 0;
`;

ToolbarStyled.displayName = 'ToolbarStyled';
