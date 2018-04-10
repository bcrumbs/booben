import styled from 'styled-components';
import componentConstants from '../../styles/constants';
import { colorBorder } from '../../../../styles/themeSelectors';

export const LayoutItemStyled = styled.div`
  margin: ${componentConstants.itemsSpacing}px;
  padding: ${componentConstants.itemPadding}px;
  cursor: pointer;
  width: ${componentConstants.itemMaxWidth}px;
  border: 1px solid transparent;

  &:hover {
      border-color: ${colorBorder};
  }
`;

LayoutItemStyled.displayName = 'LayoutItemStyled';
