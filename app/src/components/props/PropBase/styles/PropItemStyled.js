'use strict';

import styled, { css } from 'styled-components';
import constants from '../../styles/constants';
import { baseModule } from '../../../../styles/themeSelectors';

const sublevelVisible = ({ sublevelVisible }) => sublevelVisible
  ? css`
    padding-bottom: ${baseModule(1)}px;
  `
  : '';

export const PropItemStyled = styled.div`
  margin: 0;
  margin-top: ${baseModule(2)}px;
  width: 100%;
  padding: 0;
  min-height: ${constants.item.baseHeight}px;
  ${sublevelVisible}
  
  &:first-child {
    margin-top: 0;
  }
`;

PropItemStyled.displayName = 'PropItemStyled';
