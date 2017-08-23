import styled from 'styled-components';
import constants from '../../styles/constants';

export const ItemStyled = styled.div`
  position: relative;
  padding: ${constants.itemPadY}px ${constants.itemPadX}px;
`;

ItemStyled.displayName = 'ItemStyled';
