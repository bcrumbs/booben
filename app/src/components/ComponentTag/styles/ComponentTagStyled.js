'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from '@reactackle/reactackle';
import constants from './constants';

import {
  baseModule,
  paletteBlueGrey25,
  paletteBlueGrey200,
  colorActiveBg,
} from '../../../styles/themeSelectors';

const propTypes = {
  focused: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  focused: false,
  colorScheme: 'dark',
};

const TAGS_PER_ROW = 3;
const TAG_BASE_WIDTH = 100 / TAGS_PER_ROW;
const BORDER_COLOR = constants.borderColor;
const BORDER_WIDTH = constants.borderWidth;

const focused = ({ focused }) => focused
  ? `
    background-color: ${colorActiveBg};
    border-color: ${paletteBlueGrey200};
  `
  : '';

export const ComponentTagStyled = styled.div`
  box-sizing: border-box;
  padding: ${baseModule(0.25)}px;
  border: ${BORDER_WIDTH}px solid ${BORDER_COLOR};
  border-left-width: 0;
  margin-top: -${BORDER_WIDTH}px;
  cursor: move;
  flex-shrink: 0;
  flex-basis: ${TAG_BASE_WIDTH}%;
  max-width: ${TAG_BASE_WIDTH}%;
  flex-grow: 1;
  display: flex;
  align-items: stretch;
  user-select: none;
  ${focused}
  ${transition('border, background')};

  &:hover {
    background-color: ${paletteBlueGrey25};
  }
  
  &:nth-child(${TAGS_PER_ROW}n) {
    border-right-width: 0;
  }
`;

ComponentTagStyled.displayName = 'ComponentTagStyled';
ComponentTagStyled.propTypes = propTypes;
ComponentTagStyled.defaultProps = defaultProps;
