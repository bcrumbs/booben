'use strict';

import styled from 'styled-components';
import { boxShadow } from '../../../styles/mixins';

import {
  colorWhite,
  radiusDefault,
  bodyFontFamily,
} from '../../../styles/themeSelectors';

const boxShadow3 = boxShadow(3);

export const MenuOverlappingStyled = styled.div`
  width: 100%;
  max-width: 16em;
  padding: 0;
  overflow-y: auto;
  max-height: 400px;
  background-color: ${colorWhite};
  border-radius: ${radiusDefault}px;
  ${boxShadow3}
  
  &,
  & * {
    font-family: ${bodyFontFamily};
  }
`;

MenuOverlappingStyled.displayName = 'MenuOverlappingStyled';
