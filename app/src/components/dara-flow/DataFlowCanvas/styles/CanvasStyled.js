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

export const calcBackgroundSize = scale => {
  const lrg = CSIZE_LRG * scale;
  const sml = CSIZE * scale;

  return `
    ${lrg}px ${lrg}px,
    ${lrg}px ${lrg}px,
    ${sml}px ${sml}px,
    ${sml}px ${sml}px
  `;
};

export const calcBackgroundPosition = (offsetX, offsetY) => `
    ${offsetX}px ${offsetY}px,
    ${offsetX}px ${offsetY}px,
    ${offsetX}px ${offsetY}px,
    ${offsetX}px ${offsetY}px
  `;

/* eslint-disable max-len */
export const CanvasStyled = styled.div`
  flex-grow: 1;
  width: 100%;
  background-color: ${paletteBlueGrey500};
  color: white;
  overflow: hidden;
  
  background-image:
    linear-gradient(${LCOLOR_LRG} ${LWIDTH_LRG}px, transparent ${LWIDTH_LRG}px),
    linear-gradient(90deg, ${LCOLOR_LRG} ${LWIDTH_LRG}px, transparent ${LWIDTH_LRG}px),
    linear-gradient(${LCOLOR} ${LWIDTH}px, transparent ${LWIDTH}px),
    linear-gradient(90deg, ${LCOLOR} ${LWIDTH}px, transparent ${LWIDTH}px);
    
  background-size: ${calcBackgroundSize(1)};
  background-position: ${calcBackgroundPosition(0, 0)};
`;
/* eslint-enable max-len */

CanvasStyled.displayName = 'CanvasStyled';
