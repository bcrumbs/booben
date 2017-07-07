'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from '@reactackle/reactackle';
import componentConstants from '../../styles/constants';
import { paletteBlueGrey600 } from '../../../../styles/themeSelectors';

const propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical', 'entire']),
};

const defaultProps = {
  position: 'horizontal',
};

const lineComboWidth = 6,
  lineThickness = 2,
  iconWidth = componentConstants.rulerWidth - 4, // 4 - icon paddings
  iconLength = componentConstants.rulerWidth * 1.6,
  iconColor = paletteBlueGrey600;

/*
 * TODO add gradient for corner icon
 * ex scss code
 * @include diagonal-linear(
     $color-1: transparent,
     $color-2: $cpane-expander-icon-color,
     $lines: 2,
     $line-thickness: rem-calc(2)
   );
 *
 * @mixin diagonal-linear($color-2, $lines: 2, $line-thickness: rem-calc(2),
  * $color-1: transparent, $angle: 135deg) {
     $generator: ();
     @for $i from 1 through $lines {
       $generator: append(
         $generator,
         (
           $color-1 $line-thickness*($i*2 - 2),
           $color-1 $line-thickness*($i*2 - 1),
           $color-2 $line-thickness*($i*2 - 1),
           $color-2 $line-thickness*($i*2)
         ),
         comma
       )
     };
     
     $generator: append(
       $generator,
       (
         $color-1 $line-thickness*(($lines+1) + 1),
         $color-1 $line-thickness*(($lines+1) + 1)
       ),
       comma
     );
     
     background-image:
       linear-gradient(
         $angle,
         #{$generator}
       );
   }
*/

const position = ({ position }) => {
  let styles = null;
  
  if (position === 'horizontal') {
    styles = `
      height: ${iconWidth}px;
      width: ${iconLength}px;
      background-image: linear-gradient(
          to bottom,
          ${iconColor} ${lineThickness}px,
          transparent ${lineThickness}px
        );
      background-size: ${lineComboWidth * 2}px;
      background-position-y:
        ${iconWidth / 2 - lineComboWidth + lineThickness}px;   
    `;
  } else if (position === 'vertical') {
    styles = `
      width: ${iconWidth}px;
      height: ${iconLength}px;
      background-image: linear-gradient(
          to right,
          ${iconColor} ${lineThickness}px,
          transparent ${lineThickness}px
        );
      background-size: ${lineComboWidth}px;
      background-position-x:
        ${iconWidth / 2 - lineComboWidth + lineThickness}px; 
    `;
  } else {
    styles = `
      height: ${iconWidth}px;
      width: ${iconWidth}px;
      transform:  translate3d(-50%, -50%, 0) rotate(180deg);
    `;
  }
  
  return styles;
};

export const IconStyled = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  z-index: 10;
  ${position}
  ${transition('opacity')}

  &:hover {
    opacity: 1;
  }
`;

IconStyled.displayName = 'IconStyled';
IconStyled.propTypes = propTypes;
IconStyled.defaultProps = defaultProps;
