import styled from 'styled-components';

import {
  textColorBody,
  bodyFontFamily,
  fontSizeBody,
} from '../../../../styles/themeSelectors';

export const MenuStyled = styled.div`
  width: 100%;
  color: ${textColorBody};
  font-size: ${fontSizeBody}px;
  
  &,
  & * {
    font-family: ${bodyFontFamily};
  }
`;

MenuStyled.displayName = 'MenuStyled';
