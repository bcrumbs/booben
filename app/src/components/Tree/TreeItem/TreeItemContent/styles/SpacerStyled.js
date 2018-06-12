import styled from 'styled-components';
import constants from '../../../styles/constants';

const size = constants.buttonSize;

const spacerSize = ({ removeSpacer }) => !removeSpacer && `
  width: ${size}px;
  min-width: ${size}px;
  height: ${size}px;
`;

export const SpacerStyled = styled.div`
  display: block;     
  flex-shrink: 0;
  ${spacerSize}
`;
