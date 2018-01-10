import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const DataWindowTitleActionsStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: ${baseModule(1.5)}px;
  
  & > * + * {
    margin-left: ${baseModule(0.25)}px;
  }
`;

DataWindowTitleActionsStyled.displayName = 'DataWindowTitleActionsStyled';
