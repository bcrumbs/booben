import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';
import constants from '../../styles/constants';

export const BlockContentPlaceholderContentStyled = styled.div`
  width: 100%;
  flex-shrink: 0;
  text-align: center;
  user-select: none;
  padding: ${baseModule(2)}px ${constants.basePaddingX}px;
`;

BlockContentPlaceholderContentStyled.displayName =
  'BlockContentPlaceholderContentStyled';
