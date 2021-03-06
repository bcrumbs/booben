import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { baseModule, colorSecondary } from '../../../../styles/themeSelectors';

const propTypes = {
  focused: PropTypes.bool,
};

const defaultProps = {
  focused: false,
};

const focused = ({ focused }) => focused
  ? css` border-left: ${baseModule(1)}px solid ${colorSecondary}; `
  : '';

export const CardContentStyled = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: stretch;
  ${focused}
`;

CardContentStyled.displayName = 'CardContentStyled';
CardContentStyled.propTypes = propTypes;
CardContentStyled.defaultProps = defaultProps;
