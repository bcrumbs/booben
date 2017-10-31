import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';

const propTypes = {
  bordered: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  bordered: false,
  colorScheme: 'dark',
};

const bordered = ({ bordered, colorScheme }) => bordered
  ? css`border-top: 1px solid ${constants[colorScheme].blocksSeparatorColor};`
  : '';

export const BlockContentNavigationStyled = styled.div`
  flex-shrink: 0;
  ${bordered}
`;

BlockContentNavigationStyled.propTypes = propTypes;
BlockContentNavigationStyled.defaultProps = defaultProps;
BlockContentNavigationStyled.displayName = 'BlockContentNavigationStyled';
