'use strict';

import styled from 'styled-components';
import { animations } from '@reactackle/reactackle';
import PropTypes from 'prop-types';

const propTypes = {
  image: PropTypes.string,
  overlayColor: PropTypes.string,
  color: PropTypes.string,
};

const defaultProps = {
  image: '',
  overlayColor: '',
  color: '',
};

const background = ({ image, color, overlayColor }) => {
  const pseudoChildBase = `
    display: block;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    z-index: 0;
  `;

  const imageStyle = image
    ? css`
        &::before {
          background-image: url('${image}');
          ${pseudoChildBase}
        }
      `
    : '';

  const overlayStyle = overlayColor
    ? css`
        &::after {
          background-color: ${overlayColor};
          ${pseudoChildBase}
        }
      `
    : '';

  const bgColor = color
    ? `background-color: ${color};`
    : '';

  return css`
    ${bgColor}
    ${imageStyle}
    ${overlayStyle}
  `;
};

export const StateScreenStyled = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${animations.fadeIn} 300ms ease-in;
  position: relative;
`;

StateScreenStyled.displayName = 'StateScreenStyled';
StateScreenStyled.propTypes = propTypes;
StateScreenStyled.defaultProps = defaultProps;
