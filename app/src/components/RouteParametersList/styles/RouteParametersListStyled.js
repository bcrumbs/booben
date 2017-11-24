import styled from 'styled-components';
import { baseModule } from '../../../styles/themeSelectors';

export const RouteParametersListStyled = styled.ul`
  margin: 0;
  margin-top: ${baseModule(0.5)}px;
  padding: 0;
  list-style-type: none;
`;

RouteParametersListStyled.displayName = 'RouteParametersListStyled';
