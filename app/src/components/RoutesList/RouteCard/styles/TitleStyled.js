'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import componentTheme from '../styles/constants';

import {
  textColorBody,
  textColorMedium,
  fontSizeBody,
} from '../../../../styles/themeSelectors';

const propTypes = {
  index: PropTypes.bool,
};

const defaultProps = {
  index: false,
};

const index = ({ index }) => index
  ? css`
    color: ${textColorMedium};
    font-size: ${fontSizeBody}px;
    line-height: 1.5;
  `
  : '';

export const TitleStyled = styled.span`
  font-size: ${componentTheme.titleFontSize}px;
  line-height: 1.3;
  color: ${textColorBody};
  ${index}
`;

TitleStyled.displayName = 'TitleStyled';
TitleStyled.propTypes = propTypes;
TitleStyled.defaultProps = defaultProps;
