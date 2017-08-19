'use strict';

import styled, { css } from 'styled-components';
import constants from '../../styles/constants';

import {
  baseModule,
} from '../../../../styles/themeSelectors';

const bordered = ({ bordered }) => css`
  border-top: 1px solid ${constants.colorBorder};
`;

const hasPaddings = ({ hasPaddings }) => hasPaddings
  ? css`padding: ${baseModule(1.5)}px;`
  : '';

export const PanelItemStyled = styled.div`
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  user-select: none;
  ${bordered}
  ${hasPaddings}
`;

PanelItemStyled.displayName = 'PanelItemStyled';
