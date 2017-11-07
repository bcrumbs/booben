import styled from 'styled-components';
import constants from '../../../styles/constants';
import { baseModule } from '../../../../../styles/themeSelectors';

export const PageDrawerActionsGroupStyled = styled.div`
  flex-shrink: 0;
  padding: ${baseModule(0.25)}px 0;
  
  &:last-child {
      flex-grow: 1;
  }
  
  & + & {
    border-top: 1px solid ${constants.actions.groupSeparatorColor};
  }
`;

PageDrawerActionsGroupStyled.displayName = 'PageDrawerActionsGroupStyled';
