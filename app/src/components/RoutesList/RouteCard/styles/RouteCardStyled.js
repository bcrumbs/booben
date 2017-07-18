'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const RouteCardStyled = styled.li`
  & + & {
    margin-top: ${baseModule(1)}px;
  }
`;

RouteCardStyled.displayName = 'RouteCardStyled';
