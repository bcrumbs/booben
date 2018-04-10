import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

const itemsPerRow = 2;
const itemWidth = 100 / itemsPerRow;

export const LayoutItemStyled = styled.div`
  padding: ${baseModule(1)}px;
  cursor: pointer;
  width: ${itemWidth}%;
  max-width: ${itemWidth}%;
  flex-grow: 1;
  user-select: none;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

LayoutItemStyled.displayName = 'LayoutItemStyled';
