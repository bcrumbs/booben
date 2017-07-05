'use strict';

import styled, { css } from 'styled-components';
import { transition } from '@reactackle/reactackle';

import {
  radiusDefault,
  colorActiveBg,
  colorLightBlue,
} from '../../../styles/themeSelectors';

const placed = ({ placed }) => placed
  ? `
    position: relative;
    min-height: 0;
  `
  : `
    width: 100px;
    height: 100px;
  `;

const visible = ({ visible }) => css`opacity: ${visible ? '1' : '0'};`;

export const ComponentPlaceholderStyled = styled.div`  
  position: absolute;
  z-index: 8000;
  padding: 0;
  line-height: 1;
  overflow: hidden;
  background-color: ${colorActiveBg};
  border: 1px solid ${colorLightBlue};
  border-radius: ${radiusDefault}px;
  cursor: move;
  user-select: none;
  ${placed}
  ${visible}
  ${transition('opacity')}
`;

ComponentPlaceholderStyled.displayName = 'ComponentPlaceholderStyled';
