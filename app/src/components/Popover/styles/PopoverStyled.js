import styled, { css } from 'styled-components';
import { triangle, oppositeDirection } from '../../../styles/mixins/elements';
import { boxShadow } from '../../../styles/mixins';

import {
  radiusDefault,
  paletteBlueGrey700,
  paletteBlueGrey25,
  bodyFontFamily,
} from '../../../styles/themeSelectors';

const triWidth = 10;
const triHeight = 10;
const bgColor = paletteBlueGrey700;
const boxShadow3 = boxShadow(3);

const triangleElement = ({ position }) => {
  const positionStyles = position === 'top' || position === 'bottom'
    ? `
      ${oppositeDirection(position)}: -${triHeight}px;
      left: 50%;
      transform: translateX(-${triWidth}px);
    `
    : css`
      top: 50%;
      transform: translateY(-${triHeight}px);
      ${oppositeDirection(position)}: -${triWidth}px;
    `;

  return css`      
    &::before {
      content: '';
      position: absolute;
      ${positionStyles}
      
      ${triangle(
        oppositeDirection(position),
        bgColor,
        triWidth,
        triHeight,
        'px',
      )}
    }
  `;
};

const position = ({ position }) => position === 'top' || position === 'bottom'
    ? `transform: translate3d(-50%, ${triHeight}px, 0);`
    : `transform: translate3d(${triHeight}px, -50%, 0);`;

export const PopoverStyled = styled.div`
  width: 100%;
  color: ${paletteBlueGrey25};
  background-color: ${bgColor};
  border-radius: ${radiusDefault}px;
  font-family: ${bodyFontFamily};
  position: absolute;
  z-index: 99;
  ${position}
  ${boxShadow3}
  ${triangleElement}
`;

PopoverStyled.displayName = 'PopoverStyled';
