'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const DataRowStyled = styled.div`
  margin-top: ${baseModule(1)}px;
  width: 100%;
  user-select: none;
`;

DataRowStyled.displayName = 'DataRowStyled';
