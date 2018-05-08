import styled from 'styled-components';
import constants from '../../styles/constants';

const size = constants.buttonSize;

export const SpacerStyled = styled.div`
  display: block;
  
  li li & {    
    width: ${size}px;
    min-width: ${size}px;
    height: ${size}px;
  }
`;

SpacerStyled.displayName = 'SpacerStyled';
