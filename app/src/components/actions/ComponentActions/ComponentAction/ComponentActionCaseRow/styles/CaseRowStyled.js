'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../../../styles/themeSelectors';

export const CaseRowStyled = styled.div`
  margin-top: ${baseModule(1.5)}px;
  
  & + & {
    margin-top: ${baseModule(2)}px;
  }  
`;

CaseRowStyled.displayName = 'CaseRowStyled';
