import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from '@reactackle/reactackle';
import constants from './constants';

import {
  baseModule,
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
const BORDER_WIDTH = constants.borderWidth;

const focused = ({ focused, colorScheme }) => focused
  ? css`
    background-color: ${constants[colorScheme].tag.bgColorFocused};
    border-color: ${constants[colorScheme].separatorColor};
  `
  : '';

const colorScheme = ({ colorScheme }) => css`
  border: ${BORDER_WIDTH}px solid ${constants[colorScheme].separatorColor};

  &:hover {
    background-color: ${constants[colorScheme].tag.bgColorHover};
  }
`;

/* colorScheme should be placed first because of border redefining */
export const ComponentTagStyled = styled.div`
  ${colorScheme}  
  box-sizing: border-box;
  padding: ${baseModule(0.25)}px;
  margin-top: -${BORDER_WIDTH}px;
  cursor: move;
  flex-shrink: 0;
  flex-basis: ${TAG_BASE_WIDTH}%;
  max-width: ${TAG_BASE_WIDTH}%;
  flex-grow: 1;
  display: flex;
  align-items: stretch;
  user-select: none;
  border-left-width: 0;
  ${focused}
  ${transition('border, background')};
  
  &:nth-child(${TAGS_PER_ROW}n) {
    border-right-width: 0;
  }
`;

ComponentTagStyled.displayName = 'ComponentTagStyled';
ComponentTagStyled.propTypes = propTypes;
ComponentTagStyled.defaultProps = defaultProps;
