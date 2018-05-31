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
  color: ${constants[colorScheme].title.color};
`;

export const BlockContentViewButtonStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: ${constants.title.minHeight}px;
  min-width: 0;
  background-color: transparent;
  ${colorScheme}
  
  &:hover,
  &:focus {
    background-color: rgba(0,0,0,0.1);
  }
`;

BlockContentViewButtonStyled.propTypes = propTypes;
BlockContentViewButtonStyled.defaultProps = defaultProps;
