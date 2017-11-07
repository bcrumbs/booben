import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  colorScheme: 'default',
};

const colorScheme = ({ colorScheme }) => css`
  background-color: ${constants[colorScheme].placeholder.bgColor};
`;

export const BlockContentPlaceholderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  ${colorScheme}
`;

BlockContentPlaceholderStyled.displayName = 'BlockContentPlaceholderStyled';
BlockContentPlaceholderStyled.propTypes = propTypes;
BlockContentPlaceholderStyled.defaultProps = defaultProps;
