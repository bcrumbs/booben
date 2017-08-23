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
  min-width: 150px;
  font-family: ${bodyFontFamily};
  position: relative;
  ${disconnected}
`;

BlockStyled.displayName = 'BlockStyled';
