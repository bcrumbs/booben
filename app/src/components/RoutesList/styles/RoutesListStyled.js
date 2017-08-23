'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from '@reactackle/reactackle';
import { RouteCardStyled } from '../RouteCard/styles/RouteCardStyled';

import {
  baseModule,
  paletteBlueGrey500,
  paletteBlueGrey400,
} from '../../../styles/themeSelectors';

const propTypes = {
  focused: PropTypes.bool,
};

const defaultProps = {
  focused: false,
};

const heightOffset = ({ theme }) =>
  theme.reactackle.components.button.size.normal.minHeight / 2;

const focused = ({ focused }) => focused
  ? css`
    border-left: 2px solid ${paletteBlueGrey400};
    border-bottom: 2px solid ${paletteBlueGrey400};
    height: calc(100% - ${heightOffset}px);
  `
  : css`
    border-left: 1px dotted ${paletteBlueGrey500};
    border-bottom: 0px solid ${paletteBlueGrey500};
    height: 100%;
  `;

export const RoutesListStyled = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
  position: relative;
  
  ${RouteCardStyled} & {    
    margin-left: ${baseModule(2)}px;
    margin-top: ${baseModule(1)}px;
    
    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: -${baseModule(1)}px;
      width: 4px;
      ${focused}
      ${transition('border-color, height')
    }
  }
  
  ${RouteCardStyled} & ${RouteCardStyled} {
    margin-bottom: ${baseModule(1)}px;
  }
`;

RoutesListStyled.displayName = 'RoutesListStyled';
RoutesListStyled.propTypes = propTypes;
RoutesListStyled.defaultProps = defaultProps;
