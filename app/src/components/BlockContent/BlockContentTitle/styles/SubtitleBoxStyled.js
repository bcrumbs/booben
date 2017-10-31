import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';

import {
  baseModule,
  fontSizeSmall,
} from '../../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  colorScheme: 'default',
};

const colorScheme = ({ colorScheme }) => css`
  color: ${constants[colorScheme].subtitleColor};
`;

export const SubtitleBoxStyled = styled.div`
  line-height: 1.5;
  font-size: ${fontSizeSmall}px;
  overflow: hidden;
  user-select: none;
  margin-top: ${baseModule(0.25)}px;
  ${colorScheme}
`;

SubtitleBoxStyled.propTypes = propTypes;
SubtitleBoxStyled.defaultProps = defaultProps;
SubtitleBoxStyled.displayName = 'SubtitleBoxStyled';
