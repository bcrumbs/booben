import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const ButtonRowStyled = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${baseModule(1)}px;
  
  & > * {
    flex-grow: 1;
  }
`;

ButtonRowStyled.displayName = 'ButtonRowStyled';
