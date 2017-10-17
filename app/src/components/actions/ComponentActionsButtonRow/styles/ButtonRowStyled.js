import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const ButtonRowStyled = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${baseModule(2)}px;
  
  & > * + * {
    margin-left: ${baseModule(0.5)}px;
  }
`;

ButtonRowStyled.displayName = 'ButtonRowStyled';
