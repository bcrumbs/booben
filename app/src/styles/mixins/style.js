import { css } from 'styled-components';


/**
 * Create blueprint pattern
 */
/* eslint-disable max-len */
export const patternBlueprint = (
  lineSmlColor,
  lineSmlWidth,
  cellSmlSize,
  lineLrgColor,
  lineLrgWidth,
  cellLrgSize,
  offsetX,
  offsetY,
) => css`
  background-image:
    linear-gradient(${lineLrgColor} ${lineLrgWidth}px, transparent ${lineLrgWidth}px),
    linear-gradient(90deg, ${lineLrgColor} ${lineLrgWidth}px, transparent ${lineLrgWidth}px),
    linear-gradient(${lineSmlColor} ${lineSmlWidth}px, transparent ${lineSmlWidth}px),
    linear-gradient(90deg, ${lineSmlColor} ${lineSmlWidth}px, transparent ${lineSmlWidth}px);
  
  background-size:
    ${cellLrgSize}px ${cellLrgSize}px,
    ${cellLrgSize}px ${cellLrgSize}px,
    ${cellSmlSize}px ${cellSmlSize}px,
    ${cellSmlSize}px ${cellSmlSize}px;
  
  background-position:
    ${offsetX}px ${offsetY}px,
    ${offsetX}px ${offsetY}px,
    -${lineSmlWidth}px -${lineSmlWidth}px,
    -${lineSmlWidth}px -${lineSmlWidth}px;
`;
/* eslint-enable max-len */

/**
 * Set transition
 * @param {string} property - transitioned propertied
 * @param {string} [speed='300ms'] - transition speed
 * @param {string} [ease='ease-out'] - transition easing function
 * @param {string} [delay='0ms'] - transition delay
 */
export const transition = (property, speed, ease, delay) => `
  transition-property: ${property};
  transition-duration: ${speed || '300ms'};
  transition-timing-function: ${ease || 'ease-out'};
  transition-delay: ${delay || '0ms'};
`;

/**
 * Box shadow
 */
export const boxShadow = (elevation = 0, color = 'rgba(0, 0, 0, 0.1)') => {
  const blur1 = 2;
  const offset1 = 0;
  const x1 = 0;
  const y1 = blur1 / 2;
  
  const blur2 = (blur1 + 1) * elevation;
  const offset2 = (offset1 + 0.25) * elevation;
  const x2 = 0;
  const y2 = (y1 + 0.5) * elevation;
  
  const blur3 = blur2 + 1;
  const offset3 = (offset2 + 0.25);
  const x3 = 0;
  const y3 = (y2 + 0.5);
  
  return `
    box-shadow: ${x1}px ${y1}px ${blur1}px ${offset1} ${color},
    ${x2}px ${y2}px ${blur2}px ${offset2}px ${color},
    ${x3}px ${y3}px ${blur3}px ${offset3}px ${color};
  `;
};
