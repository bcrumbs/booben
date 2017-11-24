import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from '@reactackle/reactackle';

import {
  radiusDefault,
  colorWhite,
  paletteBlueGrey50,
} from '../../../../styles/themeSelectors';

const propTypes = {
  focused: PropTypes.bool,
  index: PropTypes.bool,
};

const defaultProps = {
  focused: false,
  index: false,
};

const index = ({ index, focused }) => index
  ? css`
    background-color: ${paletteBlueGrey50};
    min-height: 0;
    
    ${focused ? `background-color: ${colorWhite};` : ''}

    &:hover,
    &:focus {
      background-color: ${paletteBlueGrey50};
      outline: none;
    }
  `
  : '';

export const CardStyled = styled.div`
  background-color: ${colorWhite};
  border-radius: ${radiusDefault}px;
  width: 100%;
  max-width: 20em;
  min-height: 60px;
  cursor: pointer;
  position: relative;
  user-select: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${index}
  ${transition('background-color, border')}

  &:hover,
  &:focus {
    outline: none;
    background-color: ${paletteBlueGrey50};
  }
`;

CardStyled.displayName = 'CardStyled';
CardStyled.propTypes = propTypes;
CardStyled.defaultProps = defaultProps;
