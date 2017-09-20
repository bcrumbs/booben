import styled from 'styled-components';

import {
  bodyFontFamily,
} from '../../../../styles/themeSelectors';

export const WrapperStyled = styled.div`
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: ${bodyFontFamily};
`;

WrapperStyled.displayName = 'WrapperStyled';
