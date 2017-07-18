'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import {
  fontSizeDisplay1,
  fontWeightSemibold,
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

export const TitleStyled = styled.div`
  font-size: ${fontSizeDisplay1}px;
  font-weight: ${fontWeightSemibold};
  margin-top: -30px;
  ${colorScheme}
`;

TitleStyled.propTypes = propTypes;
TitleStyled.defaultProps = defaultProps;
TitleStyled.displayName = 'TitleStyled';
