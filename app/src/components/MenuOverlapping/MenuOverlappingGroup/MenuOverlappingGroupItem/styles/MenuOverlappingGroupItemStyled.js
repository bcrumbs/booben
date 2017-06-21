'use strict';

import styled, { css } from 'styled-components';
import { transition } from '../../../../../styles/mixins';

import {
  baseModule,
  textColorMedium,
  textColorBody,
} from '../../../../../styles/themeSelectors';

const base = ({ disabled }) => {
  const cursor = disabled ? 'default' : 'pointer';
  const backgroundStyles = disabled
    ? css`
      background-color: transparent;
      color: ${textColorMedium};
    `
    : css`    
      color: ${textColorBody};
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    `;
  
  return `
    cursor: ${cursor};
    ${backgroundStyles}
  `;
};

const bgTransition = transition('background-color');

export const MenuOverlappingGroupItemStyled = styled.li`
  padding: ${baseModule(1)}px ${baseModule(1.5)}px;
  line-height: 1.25;
  vertical-align: baseline;
  user-select: none;
  ${base}
  ${bgTransition}
`;

MenuOverlappingGroupItemStyled.displayName = 'MenuOverlappingGroupItemStyled';
