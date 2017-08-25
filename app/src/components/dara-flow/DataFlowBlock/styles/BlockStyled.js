import styled, { css } from 'styled-components';

import {
  bodyFontFamily,
  colorWhite,
  paletteBlueGrey25,
} from '../../../../styles/themeSelectors';

const disconnected = ({ disconnected }) => disconnected
  ? css`background-color: ${paletteBlueGrey25};`
  : css`background-color: ${colorWhite};`;

export const BlockStyled = styled.div`
  min-width: 170px;
  font-family: ${bodyFontFamily};
  position: absolute;
  top: 0;
  left: 0;
  ${disconnected}
`;

BlockStyled.displayName = 'BlockStyled';
