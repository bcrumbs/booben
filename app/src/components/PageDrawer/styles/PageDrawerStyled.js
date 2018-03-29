import styled from 'styled-components';
import PropTypes from 'prop-types';
import constants from './constants';

const propTypes = {
  collapsed: PropTypes.bool,
  hasActions: PropTypes.bool,
};

const defaultProps = {
  collapsed: false,
  hasActions: false,
};

const width = ({ collapsed, hasActions }) => {
  const narrowWidth = hasActions
    ? constants.actionWidth + constants.verticalBorderWidth
    : 0;

  const width = collapsed ? narrowWidth : 360;

  return `
    width: ${width}px;
  `;
};

export const PageDrawerStyled = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: stretch;
  border-left: ${constants.verticalBorderWidth}px solid ${constants.content.borderColor};
  background-color: ${constants.content.bgColor};
  ${width}
`;

PageDrawerStyled.propTypes = propTypes;
PageDrawerStyled.defaultProps = defaultProps;
PageDrawerStyled.displayName = 'PageDrawerStyled';
