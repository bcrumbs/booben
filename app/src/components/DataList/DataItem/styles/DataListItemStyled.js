'use strict';

import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';

import {
  baseModule,
  radiusDefault,
} from '../../../../styles/themeSelectors';

export const DataListItemStyled = styled.div`
  border-radius: ${radiusDefault}px;
  display: flex;
  user-select: none;
  cursor: pointer;
  ${transition('background-color')};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.93);
  }

  & + & { margin-top: ${baseModule(0.5)}px; }
`;

DataListItemStyled.displayName = 'DataListItemStyled';
