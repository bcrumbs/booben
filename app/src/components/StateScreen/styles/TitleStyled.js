'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  light: PropTypes.bool,
};

const defaultProps = {
  light: false,
};

import {
  fontSizeDisplay1,
  fontWeightSemibold,
} from '../../../styles/themeSelectors';

const colorScheme = ({
  light,
}) => `color: ${light ? colorWhite : textColorBody }`;

export const TitleStyled = styled.div`
  font-size: ${fontSizeDisplay1}px;
  font-weight: ${fontWeightSemibold};
  margin-top: -30px;
  ${colorScheme}
`;

TitleStyled.propTypes = propTypes;
TitleStyled.defaultProps = defaultProps;
TitleStyled.displayName = 'TitleStyled';
