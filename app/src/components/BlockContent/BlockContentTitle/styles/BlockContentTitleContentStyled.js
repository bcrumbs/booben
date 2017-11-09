import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';
import constants from '../../styles/constants';

export const BlockContentTitleContentStyled = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${baseModule(0.5)}px ${constants.basePaddingX}px;
`;

BlockContentTitleContentStyled.displayName = 'BlockContentTitleContentStyled';
