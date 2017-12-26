import styled from 'styled-components';
import { TreeItemStyled } from './TreeItemStyled';
import constants from '../../styles/constants';

const size = constants.buttonSize;

export const SpacerStyled = styled.div`
  display: block;
  
  ${TreeItemStyled} ${TreeItemStyled} & {    
    width: ${size}px;
    min-width: ${size}px;
    height: ${size}px;
    margin-right: ${constants.buttonMargin}px;
  }
`;

SpacerStyled.displayName = 'SpacerStyled';
