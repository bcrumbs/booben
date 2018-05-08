import styled from 'styled-components';
import constants from '../../styles/constants';

export const BlockContentTitleContentStyled = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${constants.title.paddingY}px ${constants.basePaddingX}px;
`;

BlockContentTitleContentStyled.displayName = 'BlockContentTitleContentStyled';
