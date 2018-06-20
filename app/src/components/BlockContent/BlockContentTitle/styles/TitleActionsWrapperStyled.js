import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';
import constants from '../../styles/constants';

export const TitleActionsWrapperStyled = styled.div`
  display: flex;
  padding: ${baseModule(0.25)}px 0;
  padding-right: ${constants.title.actionsPaddingRight}px;

  & > * {
    margin: 0 ${constants.title.actionsSpacing}px;
  }
`;

TitleActionsWrapperStyled.displayName = 'TitleActionsWrapperStyled';
