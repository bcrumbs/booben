'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import {
  fontSizeBody2,
  fontWeightNormal,
  colorWhite,
  textColorBody,
} from '../../../styles/themeSelectors';

const propTypes = {
  light: PropTypes.bool,
};

const defaultProps = {
  light: false,
};

const colorScheme = ({ light }) => css`
  color: ${light ? colorWhite : textColorBody}
`;

export const MessageStyled = styled.div`
  font-size: ${fontSizeBody2}px;
  font-weight: ${fontWeightNormal};
  opacity: 0.6;
  ${colorScheme}
`;

MessageStyled.propTypes = propTypes;
MessageStyled.defaultProps = defaultProps;
MessageStyled.displayName = 'MessageStyled';
