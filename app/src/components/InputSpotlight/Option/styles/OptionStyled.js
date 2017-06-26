/**
 * @author Ekaterina Marova
 */

'use strict';

import styled, { css } from 'styled-components';
import { transition } from '@reactackle/reactackle';

import {
  baseModule,
  fontSizeBody,
  colorActiveBg,
} from '../../../../styles/themeSelectors';

import { inputSpotlightTheme } from '../../styles/theme';

const active = ({ active }) => active
  ? css`background-color: ${colorActiveBg};`
  : '';

export const OptionStyled = styled.li`
  padding: ${baseModule(1)}px ${inputSpotlightTheme.options.paddingX}px;
  font-size: ${fontSizeBody}px;
  line-height: 1.5;
  cursor: pointer;  
  ${transition('background-color')}
  
  &:hover,
  &:focus {
    background-color: ${colorActiveBg};
    outline: none;
    box-shadow: none;
  }
  
  ${active}
`;

OptionStyled.displayName = 'OptionStyled';
