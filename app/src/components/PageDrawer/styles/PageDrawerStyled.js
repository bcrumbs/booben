import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from './constants';

const propTypes = {
  collapsed: PropTypes.bool,
  hasActions: PropTypes.bool,
  position: PropTypes.oneOf(['left', 'right']),
};

const defaultProps = {
  collapsed: false,
  hasActions: false,
  position: 'right',
};

const oppositeDirection = {
  left: 'right',
  right: 'left',
};

const width = ({ collapsed, hasActions }) => {
  const narrowWidth = hasActions
    ? constants.actionWidth
    : 0;

  const width = collapsed ? narrowWidth : 360;

  return `
    width: ${width}px;
  `;
};

const position = ({ position }) => css`
  border-${oppositeDirection[position]}-width: ${constants.verticalBorderWidth}px;
  border-${oppositeDirection[position]}-style: solid;
  border-${oppositeDirection[position]}-color: ${constants.content.borderColor};
  order: ${position === 'right' ? 3 : 1};
`;

export const PageDrawerStyled = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: stretch;
  background-color: ${constants.content.bgColor};
  ${width}
  ${position}
`;

PageDrawerStyled.propTypes = propTypes;
PageDrawerStyled.defaultProps = defaultProps;
PageDrawerStyled.displayName = 'PageDrawerStyled';
