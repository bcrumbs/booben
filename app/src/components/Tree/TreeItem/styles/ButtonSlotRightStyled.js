import styled from 'styled-components';
import constants from '../../styles/constants';

const visibility = ({ isVisible }) => !isVisible && `
  opacity: 0;
  display: none;
  position: fixed;
  z-index: -1;
`;

export const ButtonSlotRightStyled = styled.div`
  padding-left: ${constants.itemPaddingX}px;
  margin-left: auto;
  ${visibility}
`;
