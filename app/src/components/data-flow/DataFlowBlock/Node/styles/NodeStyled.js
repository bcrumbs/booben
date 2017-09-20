import styled, { css } from 'styled-components';
import constants from '../../../styles/constants';
import { HeaderBoxStyled } from '../../styles/HeaderBoxStyled';

import {
  colorBorder,
  baseModule,
  colorError,
  colorLightBlue,
} from '../../../../../styles/themeSelectors';

const nodeSize = constants.nodeSize;

const colorScheme = ({ colorScheme }) => css`
  background-color: ${constants.color[colorScheme]};
`;

const position = ({ position }) => css`
  margin-${position}: -${nodeSize/2}px;
  ${position}: 0;
`;

const error = ({ error }) => error
  ? css`box-shadow: 0 0 3px 2px ${colorError};`
  : '';

const disconnected = ({ disconnected }) => disconnected
  ? css`    
    &:hover {
      transform: scale(1.6);
      background-color: ${colorLightBlue};
    }
  `
  : '';

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
  ${error}
  ${disconnected}
  
  ${HeaderBoxStyled} & {
    top: 50%;
  }
`;

NodeStyled.displayName = 'NodeStyled';
