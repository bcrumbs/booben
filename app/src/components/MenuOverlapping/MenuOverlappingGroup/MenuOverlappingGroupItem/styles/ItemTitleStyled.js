'use strict';

import styled from 'styled-components';
import {
  fontSizeBody,
} from '../../../../../styles/themeSelectors';

export const ItemTitleStyled = styled.span`
  font-size: ${fontSizeBody}px;  
  line-height: 1.5;
  margin-right: 0.3em;
  color: inherit;
`;

ItemTitleStyled.displayName = 'ItemTitleStyled';
