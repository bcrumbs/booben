import styled from 'styled-components';

import {
  baseModule,
  colorBorder,
} from '../../../../styles/themeSelectors';

export const ActionsStyled = styled.div`
  border-top: 1px solid ${colorBorder};
  padding: ${baseModule(0.25)}px;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  
  & > * {
    margin: ${baseModule(0.5)}px;
  }
`;

ActionsStyled.displayName = 'ActionsStyled';
