/**
 * @author Ekaterina Marova
 */

'use strict';

import styled from 'styled-components';
import componentConstants from './constants';

const listMaxWidth =
  4 * (componentConstants.itemMaxWidth + componentConstants.itemsSpacing * 2);

export const SelectionListStyled = styled.div`
  max-width: ${listMaxWidth}px;
  display: flex;
  flex-wrap: wrap;
`;

SelectionListStyled.displayName = 'SelectionListStyled';
