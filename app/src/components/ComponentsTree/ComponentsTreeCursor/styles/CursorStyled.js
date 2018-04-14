import styled from 'styled-components';
import { paletteBlueGrey500 } from '../../../../styles/themeSelectors';

const lineHeight = 1;
const cursorHeight = 7;
const cursorWidth = 7;
const color = paletteBlueGrey500;

export const CursorStyled = styled.div`
  width: 100%;
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
    border-radius: 50% 50% 0;
    background-color: ${color};
    transform: rotate(-45deg);
  }
`;

CursorStyled.displayName = 'CursorStyled';
