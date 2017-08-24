import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from '@reactackle/reactackle';
import constants from './constants';

import {
  baseModule,
  fontSizeSmall,
} from '../../../styles/themeSelectors';

const propTypes = {
  focused: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  focused: false,
  colorScheme: 'dark',
};

const focused = ({ focused, colorScheme }) => css`
  color: ${focused
      ? constants[colorScheme].tag.fontColorFocused
      : constants[colorScheme].tag.fontColor
  };`;

export const TitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  line-height: 1.25;
  padding: ${baseModule(0.5)}px;
  text-align: center;
  word-wrap: break-word;
  ${transition('color')};
  ${focused}
`;

TitleStyled.displayName = 'TitleStyled';
TitleStyled.propTypes = propTypes;
TitleStyled.defaultProps = defaultProps;
