import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { iconSizeMixin } from 'reactackle-core';
import constants from '../../styles/constants';

import {
  baseModule,
} from '../../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  colorScheme: 'default',
};

const iconBoxSize = 20;

const colorScheme = ({ colorScheme }) =>
  css`color: ${constants[colorScheme].titleIcon.color};`;

export const IconBoxStyled = styled.div`
  margin-right: ${baseModule(1)}px;
  margin-left: -4px;
  ${colorScheme}
  ${iconSizeMixin(
    `${iconBoxSize}px`,
  )}
`;

IconBoxStyled.propTypes = propTypes;
IconBoxStyled.defaultProps = defaultProps;
