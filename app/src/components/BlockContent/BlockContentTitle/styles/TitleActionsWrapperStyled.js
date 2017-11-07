import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const TitleActionsWrapperStyled = styled.div`
  display: flex;
  padding: ${baseModule(0.25)}px 0;
  padding-right: ${baseModule(1)}px;

  & > * {
    margin: 0 ${baseModule(0.125)}px;
  }
`;

TitleActionsWrapperStyled.displayName = 'TitleActionsWrapperStyled';
