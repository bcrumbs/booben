import styled from 'styled-components';
import PropTypes from 'prop-types';
import componentConstants from '../../styles/constants';
import { paletteBlueGrey600 } from '../../../../styles/themeSelectors';

const propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical', 'entire']),
};

const defaultProps = {
  position: 'horizontal',
};

const lineComboWidth = 6;
const lineThickness = 2;
const iconWidth = componentConstants.rulerWidth - 4; // 4 - icon paddings
const iconLength = componentConstants.rulerWidth * 1.6;
const iconColor = paletteBlueGrey600;

const colorLine = i =>
  `${iconColor} ${lineThickness * (i * 2 - 2)}px,
  ${iconColor} ${lineThickness * (i * 2 - 1)}px,
  transparent ${lineThickness * (i * 2 - 1)}px,
  transparent ${lineThickness * (i * 2)}px`;

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
      background-image:
        linear-gradient(135deg, ${colorLine(1)}, ${colorLine(2)});
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

  &:hover {
    opacity: 1;
  }
`;

IconStyled.displayName = 'IconStyled';
IconStyled.propTypes = propTypes;
IconStyled.defaultProps = defaultProps;
