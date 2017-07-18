'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const TreeItemStyled = styled.li`
  position: relative;

  & + & {
    margin-top: ${baseModule(1)}px;
  }
`;

TreeItemStyled.displayName = 'TreeItemStyled';
