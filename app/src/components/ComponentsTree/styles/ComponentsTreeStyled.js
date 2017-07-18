'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../styles/themeSelectors';

export const ComponentsTreeStyled = styled.div`
  padding: ${baseModule(1.5)}px ${baseModule(2)}px;
  flex-shrink: 0;
`;

ComponentsTreeStyled.displayName = 'ComponentsTreeStyled';
