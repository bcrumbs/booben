import styled, { css } from 'styled-components';
import { transition } from 'reactackle-core';
import { baseModule, colorHover } from '../../../../styles/themeSelectors';

const selected = ({ selected }) => !selected
  ? css`
    &:hover {
      background-color: ${colorHover};
    }
  `
  : '';

export const DataListItemStyled = styled.div`
  display: flex;
  user-select: none;
  cursor: pointer;
  padding: ${baseModule(0.25)}px 0;
  ${transition('background-color')};
  ${selected}
  
  & + & { margin-top: ${baseModule(0.5)}px; }
`;

DataListItemStyled.displayName = 'DataListItemStyled';
