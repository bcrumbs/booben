'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import {
  baseModule,
  paletteBlueGrey25,
  textColorMedium,
  colorError,
  colorWhite,
  fontSizeSmall,
} from '../../../../styles/themeSelectors';

const propTypes = {
  messageColorScheme: PropTypes.oneOf(['neutral', 'error']),
};

const defaultProps = {
  messageColorScheme: 'neutral',
};

const colorMap = {
  neutral: {
    bgColor: paletteBlueGrey25,
    color: textColorMedium,
  },
  
  error: {
    bgColor: colorError,
    color: colorWhite,
  },
};

const colorScheme = ({ colorScheme }) => css`
  background-color: ${colorMap[colorScheme].bgColor};
  
  &,
  a {
    color: ${colorMap[colorScheme].color};
  }
`;

export const MessageStyled = styled.div`
  padding: ${baseModule(2)}px;
  font-size: ${fontSizeSmall}px;
  line-height: 1.25;
  ${colorScheme}
`;

MessageStyled.propTypes = propTypes;
MessageStyled.defaultProps = defaultProps;
MessageStyled.displayName = 'MessageStyled';
