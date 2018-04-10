import styled, { css } from 'styled-components';
import { colorHover, radiusDefault } from '../../../../styles/themeSelectors';

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
  padding: 0;
  border-radius: ${radiusDefault}px;
  ${selected}
`;

DataListItemStyled.displayName = 'DataListItemStyled';
