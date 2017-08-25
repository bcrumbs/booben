import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../../styles/constants';

import {
  fontSizeSmall,
  fontWeightNormal,
} from '../../../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  colorScheme: 'dark',
};

const colorScheme = ({ colorScheme }) => css`
  color: ${constants[colorScheme].label.fontColor};
`;

export const LabelStyled = styled.label`
  flex-grow: 1;
  font-size: ${fontSizeSmall}px;
  line-height: 1.2;
  font-weight: ${fontWeightNormal};
  display: flex;
  margin-bottom: 0;
  position: relative;
  align-items: center;
  user-select: none;
  ${colorScheme}
`;

LabelStyled.displayName = 'LabelStyled';
LabelStyled.propTypes = propTypes;
LabelStyled.defaultProps = defaultProps;
