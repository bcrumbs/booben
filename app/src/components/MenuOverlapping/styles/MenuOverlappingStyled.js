'use strict';

import styled from 'styled-components';
import { boxShadow } from '../../../styles/mixins';
import {
  colorWhite,
  radiusDefault,
} from '../../../styles/themeSelectors';

export const MenuOverlappingStyled = styled.div`
  width: 100%;
  max-width: 16em;
  padding: 0;
  overflow-y: auto;
  max-height: 400px;
  background-color: ${colorWhite};
  border-radius: ${radiusDefault}px;
  
  ${boxShadow(3)}
`;

MenuOverlappingStyled.displayName = 'MenuOverlappingStyled';
