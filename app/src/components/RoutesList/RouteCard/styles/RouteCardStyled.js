import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const RouteCardStyled = styled.li`
  min-width: 250px;
  flex-shrink: 0;
  margin-right: ${baseModule(1)}px;

  & + & {
    margin-top: ${baseModule(1)}px;
  }
`;

RouteCardStyled.displayName = 'RouteCardStyled';
