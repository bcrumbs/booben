'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from '@reactackle/reactackle';

import {
  baseModule,
  paletteBlueGrey25,
  paletteBlueGrey200,
  colorActiveBg,
} from '../../../styles/themeSelectors';

const propTypes = {
  focused: PropTypes.bool,
};

const defaultProps = {
  focused: false,
};

const tagsPerRow = 3,
  tagBaseWidth = 100 / tagsPerRow;

const focused = ({ focused }) => focused
  ? `
    background-color: ${colorActiveBg};
    border-color: ${paletteBlueGrey200};
  `
  : '';

export const ComponentTagStyled = styled.div`
  box-sizing: border-box;
  padding: 0;
  border: 1px solid transparent;
  margin: ${baseModule(0.25)}px 0;
  cursor: move;
  flex-shrink: 0;
  flex-basis: ${tagBaseWidth}%;
  max-width: ${tagBaseWidth}%;
  flex-grow: 1;
  display: flex;
  align-items: stretch;
  user-select: none;
  ${focused}
  ${transition('border, background')};

  &:hover {
    background-color: ${paletteBlueGrey25};
  }
`;

ComponentTagStyled.displayName = 'ComponentTagStyled';
ComponentTagStyled.propTypes = propTypes;
ComponentTagStyled.defaultProps = defaultProps;
