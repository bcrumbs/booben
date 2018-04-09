import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
};

const defaultProps = {
  position: 'right',
};

const position = ({ position }) => position === 'left'
  && 'flex-direction: row-reverse;';

export const PageDrawerWrapperStyled = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: stretch;
  width: inherit;
  ${position}
`;

PageDrawerWrapperStyled.displayName = 'PageDrawerWrapperStyled';
PageDrawerWrapperStyled.propTypes = propTypes;
PageDrawerWrapperStyled.defaultProps = defaultProps;
