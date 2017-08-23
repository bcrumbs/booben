import styled from 'styled-components';

import {
  paletteBlueGrey300,
  paletteBlueGrey400,
  paletteBlueGrey500,
} from '../../../../styles/themeSelectors';

const LCOLOR = paletteBlueGrey400;
const LCOLOR_LRG = paletteBlueGrey300;
const LWIDTH = 1;
const LWIDTH_LRG = 2;
const CSIZE = 20;
const CSIZE_LRG = 100;
const COFFSET_LRG = 40 - LWIDTH_LRG / 2;

export const CanvasStyled = styled.div`
  flex-grow: 1;
  width: 100%;
  background-color: ${paletteBlueGrey500};
  color: white;
  
  background-image:
    linear-gradient(${LCOLOR_LRG} ${LWIDTH_LRG}px, transparent ${LWIDTH_LRG}px),
    linear-gradient(90deg, ${LCOLOR_LRG} ${LWIDTH_LRG}px,
      transparent ${LWIDTH_LRG}px),
    linear-gradient(${LCOLOR} ${LWIDTH}px, transparent ${LWIDTH}px),
    linear-gradient(90deg, ${LCOLOR} ${LWIDTH}px, transparent ${LWIDTH}px);
    
  background-size:
    ${CSIZE_LRG}px ${CSIZE_LRG}px,
    ${CSIZE_LRG}px ${CSIZE_LRG}px,
    ${CSIZE}px ${CSIZE}px,
    ${CSIZE}px ${CSIZE}px;
    
  background-position:
    ${COFFSET_LRG}px ${COFFSET_LRG}px,
    ${COFFSET_LRG}px ${COFFSET_LRG}px,
    -${LWIDTH}px -${LWIDTH}px,
    -${LWIDTH}px -${LWIDTH}px;
`;

CanvasStyled.displayName = 'CanvasStyled';
