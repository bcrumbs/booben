'use strict';

import styled, { css } from 'styled-components';
import constants from '../../../styles/constants';
import { HeaderBoxStyled } from '../../styles/HeaderBoxStyled';

import {
  colorBorder,
  baseModule,
} from '../../../../../styles/themeSelectors';

const nodeSize = 11;

const colorScheme = ({ colorScheme }) => css`
  background-color: ${constants.color[colorScheme]};
`;

const position = ({ position }) => css`
  margin-${position}: -${nodeSize/2}px;
  ${position}: 0;
`;

export const NodeStyled = styled.div`
  position: absolute;
  margin-top: -${nodeSize / 2}px;
  width: ${nodeSize}px;
  height: ${nodeSize}px;
  border: 1px solid ${colorBorder};
  border-radius: 50%;
  background-color: inherit;
  top: ${baseModule(2)}px;
  overflow: hidden;
  box-sizing: border-box;
  ${colorScheme}
  ${position}
  
  ${HeaderBoxStyled} & {
    top: 50%;
  }
`;

NodeStyled.displayName = 'NodeStyled';
