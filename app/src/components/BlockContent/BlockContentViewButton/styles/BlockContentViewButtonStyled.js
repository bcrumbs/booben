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
  flex-grow: 1;
  padding-left: ${constants.basePaddingX}px;
  ${colorScheme}
`;

BlockContentViewButtonStyled.propTypes = propTypes;
BlockContentViewButtonStyled.defaultProps = defaultProps;
