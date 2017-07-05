'use strict';

import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';
import { baseModule } from '../../../../styles/themeSelectors';

const itemsPerRow = 2,
  itemWidth = 100 / itemsPerRow;

export const LayoutItemStyled = styled.div`
  padding: ${baseModule(1)};
  cursor: pointer;
  width: ${itemWidth}%;
  max-width: ${itemWidth}%;
  flex-grow: 1;
  user-select: none;
  ${transition('background-color')};

  &:hover {
    background-color: rgba(0, 0, 0, 0.95);
  }
`;

LayoutItemStyled.displayName = 'LayoutItemStyled';
