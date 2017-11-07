/**
 * @author Ekaterina Marova
 */

import styled, { css } from 'styled-components';
import { transition } from '@reactackle/reactackle';

import {
  baseModule,
  fontSizeBody,
  colorActiveBg,
} from '../../../../styles/themeSelectors';

const active = ({ active }) => active
  ? css`background-color: ${colorActiveBg};`
  : '';

export const OptionStyled = styled.li`
  padding: ${baseModule(1)}px ${baseModule(1.5)}px;
  font-size: ${fontSizeBody}px;
  line-height: 1.5;
  cursor: pointer;
  ${active}
  ${transition('background-color')}
  
  &:hover,
  &:focus {
    background-color: ${colorActiveBg};
    outline: none;
    box-shadow: none;
  }
`;

OptionStyled.displayName = 'OptionStyled';
