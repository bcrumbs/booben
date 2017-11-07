import styled from 'styled-components';
import { baseModule } from '../../../../../../styles/themeSelectors';

export const ButtonStyled = styled.div`  
  & > *:first-child {
    margin-left: -${baseModule(0.5)}px;
  }
`;

ButtonStyled.displayName = 'ButtonStyled';
