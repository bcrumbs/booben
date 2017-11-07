import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';

import {
  baseModule,
  fontSizeBody,
} from '../../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  colorScheme: 'default',
};

const colorScheme = ({ colorScheme }) => css`
  color: ${constants[colorScheme].placeholder.fontColor};
`;

export const BlockContentPlaceholderTextStyled = styled.div`
  width: 100%;
  flex-shrink: 0;
  text-align: center;
  user-select: none;
  line-height: 1.5;
  text-align: center;
  font-size: ${fontSizeBody}px;
  ${colorScheme}

  & + * {
      margin-top: ${baseModule(1.5)}px;
  }
`;

BlockContentPlaceholderTextStyled.propTypes = propTypes;
BlockContentPlaceholderTextStyled.defaultProps = defaultProps;
BlockContentPlaceholderTextStyled.displayName =
  'BlockContentPlaceholderTextStyled';
