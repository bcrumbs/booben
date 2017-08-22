'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import {
  textColorBody,
  textColorMedium,
} from '../../../../styles/themeSelectors';

const propTypes = {
  index: PropTypes.bool,
};

const defaultProps = {
  index: false,
};

const index = ({ index }) => index
  ? css`color: ${textColorMedium};`
  : css`color: ${textColorBody};`;

export const TitleStyled = styled.span`
  font-size: inherit;
  line-height: inherit;
  ${index}
`;

TitleStyled.displayName = 'TitleStyled';
TitleStyled.propTypes = propTypes;
TitleStyled.defaultProps = defaultProps;
