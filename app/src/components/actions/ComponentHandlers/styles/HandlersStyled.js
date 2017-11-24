import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const HandlersStyled = styled.div`
  & + & {
    margin-top: ${baseModule(1)}px;
  }
`;

HandlersStyled.displayName = 'HandlersStyled';
