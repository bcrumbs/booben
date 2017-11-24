import styled from 'styled-components';
import constants from '../../../styles/constants';
import { baseModule } from '../../../../../styles/themeSelectors';

export const PageDrawerActionPlaceholderStyled = styled.div`
  flex-shrink: 0;
  padding: ${baseModule(0.5)}px ${baseModule(0.5)}px;
  width: ${constants.actionWidth}px;
  height: ${constants.actionWidth}px;
`;

PageDrawerActionPlaceholderStyled.displayName =
  'PageDrawerActionPlaceholderStyled';
