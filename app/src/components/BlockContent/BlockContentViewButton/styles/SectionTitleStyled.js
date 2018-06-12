import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import {
  textColorMedium,
  textColorMediumDark,
  fontSizeSmall,
} from '../../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  colorScheme: 'default',
};

const colorScheme = ({ colorScheme }) => colorScheme === 'default'
  ? css`color: ${textColorMediumDark};`
  : css`color: ${textColorMedium};`;

export const SectionTitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  ${colorScheme}
`;

SectionTitleStyled.propTypes = propTypes;
SectionTitleStyled.defaultProps = defaultProps;
