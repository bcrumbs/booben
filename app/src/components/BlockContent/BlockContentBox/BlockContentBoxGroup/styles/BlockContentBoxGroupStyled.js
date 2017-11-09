import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../../styles/constants';

const propTypes = {
  shading: PropTypes.oneOf(['default', 'editing', 'dim']),
  colorScheme: PropTypes.oneOf(['default', 'alt']),
  bordered: PropTypes.bool,
};

const defaultProps = {
  shading: 'default',
  colorScheme: 'default',
  bordered: false,
};

const colorScheme = ({ colorScheme, shading }) => css`
  background-color: ${constants[colorScheme].shading[shading].backgroundColor};
`;

const bordered = ({ bordered, colorScheme }) => bordered
  ? css`border-top: 1px solid ${constants[colorScheme].blocksSeparatorColor};`
  : '';

export const BlockContentBoxGroupStyled = styled.div`
  display: flex;
  flex-direction: column;
  ${colorScheme}
  ${bordered}
`;

BlockContentBoxGroupStyled.propTypes = propTypes;
BlockContentBoxGroupStyled.defaultProps = defaultProps;
BlockContentBoxGroupStyled.displayName = 'BlockContentBoxGroupStyled';
