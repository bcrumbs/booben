import styled, { css } from 'styled-components';
import { transition } from '@reactackle/reactackle';

import {
  baseModule,
  radiusDefault,
  paletteBlueGrey25,
} from '../../../../styles/themeSelectors';

const selected = ({ selected }) => !selected
  ? css`
    &:hover {
      background-color: ${paletteBlueGrey25};
    }
  `
  : '';

export const DataListItemStyled = styled.div`
  border-radius: ${radiusDefault}px;
  display: flex;
  user-select: none;
  cursor: pointer;
  padding: ${baseModule(0.25)}px 0;
  ${transition('background-color')};
  ${selected}
  
  & + & { margin-top: ${baseModule(0.5)}px; }
`;

DataListItemStyled.displayName = 'DataListItemStyled';
