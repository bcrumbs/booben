import styled from 'styled-components';

import {
  bodyFontFamily,
} from '../../../../styles/themeSelectors';

export const WrapperStyled = styled.div`
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  font-family: ${bodyFontFamily};
`;

WrapperStyled.displayName = 'WrapperStyled';
