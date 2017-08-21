'use strict';

import styled, { css } from 'styled-components';
import { iconSize } from '../../../../../styles/mixins/elements';

import {
  colorWhite,
} from '../../../../../styles/themeSelectors';

export const IconStyled = styled.div`
  color: ${colorWhite};
  opacity: 0;
  ${iconSize('9px', '9px', '7px', 'font')}
  
  &:hover {
    opacity: 1;
  }
`;

IconStyled.displayName = 'IconStyled';
