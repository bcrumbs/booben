import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';
import constants from '../../styles/constants';

export const ActionsStyled = styled.div`
  margin-left: ${baseModule(1)}px;
  margin-right: ${constants.title.actionsPaddingRight}px;

  & > * {
    margin: 0 ${constants.title.actionsSpacing}px;
  }
`;
