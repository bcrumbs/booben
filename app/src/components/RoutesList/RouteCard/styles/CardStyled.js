'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { boxShadow, transition } from '@reactackle/reactackle';

import {
  baseModule,
  radiusDefault,
  colorWhite,
  colorSecondary,
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

const boxShadowValue = boxShadow(1);

const focused = ({ focused }) => focused
  ? css`
    background-color: ${colorWhite};
    border-left: ${baseModule(1)}px solid ${colorSecondary};
    cursor: default;
  `
  : '';

const index = ({ index, focused }) => index
  ? css`
    background-color: ${paletteBlueGrey50};
    min-height: 0;
    
    ${focused ? `background-color: ${colorWhite};` : ''}

    &:hover,
    &:focus {
        background-color: ${paletteBlueGrey50};
        outline: none;
        ${boxShadowValue}
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
  ${boxShadowValue}
  ${focused}
  ${index}
  ${transition('background-color, box-shadow, border')}

  &:hover,
  &:focus {
    outline: none;
    background-color: ${paletteBlueGrey50};
  }
`;

CardStyled.displayName = 'CardStyled';
CardStyled.propTypes = propTypes;
CardStyled.defaultProps = defaultProps;
