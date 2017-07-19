'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const CardContentStyled = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  padding: ${baseModule(1)}px ${baseModule(2)}px;
`;

CardContentStyled.displayName = 'CardContentStyled';
