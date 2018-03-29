import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../../styles/constants';

import {
  baseModule,
  fontSizeSmall,
  fontWeightSemibold,
} from '../../../../../styles/themeSelectors';

const propTypes = {
  bordered: PropTypes.bool,
  removePaddingX: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  bordered: false,
  removePaddingX: false,
  colorScheme: 'default',
};

const removePaddingX = ({ removePaddingX }) => removePaddingX
  ? `
      padding-left: 0;
      padding-right: 0;
    `
  : '';

const bordered = ({ bordered, colorScheme }) => bordered
  ? css`border-top: 1px solid ${constants[colorScheme].blocksSeparatorColor};`
  : '';

const colorScheme = ({ colorScheme }) => css`
  color: ${constants[colorScheme].contentHeading.textColor};
`;

export const BlockContentBoxHeadingStyled = styled.div`
  user-select: none;
  line-height: 1.2;
  font-size: ${fontSizeSmall}px;
  font-weight: ${fontWeightSemibold};
  text-transform: uppercase;
  padding: 0 ${constants.basePaddingX}px;
  padding-top: ${constants.basePaddingY}px;
  margin-bottom: ${baseModule(1.5)}px;
  letter-spacing: 0.05em;
  ${bordered}
  ${colorScheme}
  ${removePaddingX}
`;

BlockContentBoxHeadingStyled.propTypes = propTypes;
BlockContentBoxHeadingStyled.defaultProps = defaultProps;
BlockContentBoxHeadingStyled.displayName = 'BlockContentBoxHeadingStyled';
