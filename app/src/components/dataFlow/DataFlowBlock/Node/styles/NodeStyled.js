'use strict';

import styled from 'styled-components';
import { HeaderBoxStyled } from '../../styles/HeaderBoxStyled';

import {
  colorBorder,
  baseModule,
} from '../../../../../styles/themeSelectors';

const nodeSize = 10;

export const NodeStyled = styled.div`
  position: absolute;
  margin-top: -${nodeSize / 2}px;
  width: ${nodeSize}px;
  height: ${nodeSize}px;
  border: 1px solid ${colorBorder};
  border-radius: 50%;
  background-color: inherit;
  margin-left: -${nodeSize/2}px;
  top: ${baseModule(1.5)}px;
  left: 0;
  
  ${HeaderBoxStyled} & {
    margin-right: -${nodeSize/2}px;
    margin-left: 0;
    top: 50%;
    left: auto;
    right: 0;
  }
`;

NodeStyled.displayName = 'NodeStyled';
