/**
 * @author Ekaterina Marova
 */

import styled from 'styled-components';
import { animations } from 'reactackle-core';
import { paletteBlueGrey300 } from '../../../../styles/themeSelectors';

const lineHeight = 1;
const cursorHeight = 9;
const cursorWidth = 9;
const color = paletteBlueGrey300;

export const CursorStyled = styled.div`
  width: 100%;
  animation: ${animations.fadeIn} 1.5s infinite linear both;
  position: relative;
  height: ${cursorHeight}px;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    font-size: 0;
    line-height: 0;
  }
  
  &::before {
    height: 0;
    width: 100%;
    border-top: ${lineHeight}px dashed ${color};
    top: 50%;
    margin-top: -${lineHeight / 2}px
  }
  
  &::after {
    top: 0;
    width: ${cursorHeight}px;
    height: ${cursorWidth}px;
    border: 1px solid ${color};
    border-radius: 50% 50% 0;
    background-color: white;
    transform: rotate(-45deg);
  }
`;

CursorStyled.displayName = 'CursorStyled';
