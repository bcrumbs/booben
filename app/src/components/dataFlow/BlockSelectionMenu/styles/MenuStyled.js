'use strict';

import styled from 'styled-components';

import {
  colorWhite,
  bodyFontFamily,
  fontSizeBody,
} from '../../../../styles/themeSelectors';

export const MenuStyled = styled.div`
  width: 100%;
  color: ${colorWhite};
  font-size: ${fontSizeBody}px;
  
  &,
  & * {
    font-family: ${bodyFontFamily};
  }
`;

MenuStyled.displayName = 'MenuStyled';
