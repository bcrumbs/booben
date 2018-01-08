import styled from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from 'reactackle-core';
import componentConstants from '../../styles/constants';

const propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical', 'entire']),
};

const defaultProps = {
  position: 'horizontal',
};

const thickness = componentConstants.rulerWidth;

const position = ({ position }) => {
  let styles = null;
  
  if (position === 'horizontal') {
    styles = `
      width: 100%;
      height: ${thickness}px;
      bottom: -${thickness}px;
      left: 0;
      cursor: s-resize;    
    `;
  } else if (position === 'vertical') {
    styles = `
      width: ${thickness}px;
      height: 100%;
      top: 0;
      right: -${thickness}px;
      cursor: e-resize;   
    `;
  } else {
    styles = `
      width: ${thickness}px;
      height: ${thickness}px;
      bottom: -${thickness}px;
      right: -${thickness}px;
      cursor: se-resize;
    `;
  }
  
  return styles;
};

export const ArtboardExpanderStyled = styled.div`
  opacity: 0.3;
  background-color: rgba(0, 0, 0, 0.15);
  position: absolute;
  z-index: 9;
  ${position}
  ${transition('opacity')}

  &:hover {
    opacity: 1;
  }
`;

ArtboardExpanderStyled.displayName = 'ArtboardExpanderStyled';
ArtboardExpanderStyled.propTypes = propTypes;
ArtboardExpanderStyled.defaultProps = defaultProps;
