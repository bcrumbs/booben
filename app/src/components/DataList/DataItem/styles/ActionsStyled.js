'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const ActionsStyled = styled.div`
  display: flex;
  align-items: center;
  margin-left: ${baseModule(1)}px;
  margin-right: ${baseModule(1)}px;
`;

ActionsStyled.displayName = 'ActionsStyled';
