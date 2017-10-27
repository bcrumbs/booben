import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import {
  textColorBodyAlt,
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
  : css`color: ${textColorBodyAlt};`;

export const TitleStyled = styled.span`
  font-size: inherit;
  line-height: inherit;
  ${index}
`;

TitleStyled.displayName = 'TitleStyled';
TitleStyled.propTypes = propTypes;
TitleStyled.defaultProps = defaultProps;
