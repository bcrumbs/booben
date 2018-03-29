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
  padding: 4px ${baseModule(1)}px;
  color: ${colorWhite};
  width: 100%;
  height: ${constants.height}px;
  min-height: ${constants.height}px;
`;

ToolbarStyled.displayName = 'ToolbarStyled';
