'use strict';

import styled from 'styled-components';
import { ContentStyled } from '../../BlockSelectionMenuItem/styles/ContentStyled';

import {
  baseModule,
} from '../../../../../styles/themeSelectors';

export const GroupStyled = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style-type: none;
  
  ${ContentStyled} & {
    margin-left: ${baseModule(1.5)}px;
  }
`;

GroupStyled.displayName = 'GroupStyled';
