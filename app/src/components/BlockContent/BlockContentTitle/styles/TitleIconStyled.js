import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { iconSizeMixin } from 'reactackle-core';
import constants from '../../styles/constants';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  colorScheme: 'default',
};

const colorScheme = ({ colorScheme }) => css`
  color: ${constants[colorScheme].titleIcon.color};
`;

export const TitleIconStyled = styled.div`
  display: flex;
  align-self: center;
  position: absolute;
  left: 0;
  ${colorScheme}
  ${iconSizeMixin('24px', '24px', '20px', '24px')}
`;

TitleIconStyled.displayName = 'TitleIconStyled';
TitleIconStyled.propTypes = propTypes;
TitleIconStyled.defaultProps = defaultProps;
