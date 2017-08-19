'use strict';

import styled from 'styled-components';

import {
  bodyFontFamily,
  colorWhite,
} from '../../../../styles/themeSelectors';

export const BlockStyled = styled.div`
  min-width: 150px;
  font-family: ${bodyFontFamily};
  background-color: ${colorWhite};
  position: relative;
`;

BlockStyled.displayName = 'BlockStyled';
