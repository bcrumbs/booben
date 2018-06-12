import styled from 'styled-components';
import { PropTypes } from 'prop-types';

const propTypes = {
  expanded: PropTypes.bool,
  disabled: PropTypes.bool,
};

const defaultProps = {
  expanded: false,
  disabled: false,
};

export const ButtonExpandStyled = styled.div`
  display: flex;
  
  ${props => props.expanded && `
    transform: rotate(90deg);
  `}
  
  ${props => props.disabled && `
    opacity: 0.5;
  `}
`;

ButtonExpandStyled.propTypes = propTypes;
ButtonExpandStyled.defaultProps = defaultProps;
