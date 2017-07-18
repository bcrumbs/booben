/**
 * @author Ekaterina Marova
 */

'use strict';

import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';
import componentConstants from '../../styles/constants';
import { colorBorder } from '../../../../styles/themeSelectors';

export const LayoutItemStyled = styled.div`
  margin: ${componentConstants.itemsSpacing}px;
  padding: ${componentConstants.itemPadding}px;
  cursor: pointer;
  width: ${componentConstants.itemMaxWidth}px;
  border: 1px solid transparent;
  ${transition('border')}

  &:hover {
      border-color: ${colorBorder};
  }
`;

LayoutItemStyled.displayName = 'LayoutItemStyled';
