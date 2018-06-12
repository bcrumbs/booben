import styled from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../../styles/constants';

const propTypes = {
  spread: PropTypes.bool,
};

const defaultProps = {
  spread: false,
};


export const PageDrawerActionsGroupStyled = styled.div`
  flex-shrink: 0;
  padding: 0;
  
  & + * {
    border-top: 1px solid ${constants.actions.groupSeparatorColor};
  }
  
  ${props => props.spread && 'flex-grow: 1;'}
`;

PageDrawerActionsGroupStyled.propTypes = propTypes;
PageDrawerActionsGroupStyled.defaultProps = defaultProps;
PageDrawerActionsGroupStyled.displayName = 'PageDrawerActionsGroupStyled';
