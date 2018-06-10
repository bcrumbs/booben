import styled from 'styled-components';
import { TreeItemStyled } from './TreeItemStyled';
import constants from '../../../styles/constants';

const size = constants.buttonSize;

export const SpacerStyled = styled.div`
  display: block;     
  width: ${size}px;
  min-width: ${size}px;
  height: ${size}px;
  flex-shrink: 0;
`;

SpacerStyled.displayName = 'SpacerStyled';
