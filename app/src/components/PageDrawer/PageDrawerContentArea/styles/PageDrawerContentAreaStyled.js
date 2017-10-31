import styled from 'styled-components';
import constants from '../../styles/constants';

export const PageDrawerContentAreaStyled = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-grow: 1;
  min-width: 0;
  background-color: ${constants.content.bgColor};
`;

PageDrawerContentAreaStyled.displayName = 'PageDrawerContentAreaStyled';
