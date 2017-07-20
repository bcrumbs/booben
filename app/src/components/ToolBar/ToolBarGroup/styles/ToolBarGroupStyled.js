'use strict';

import styled from 'styled-components';
import constants from '../../styles/constants';
import { baseModule } from '../../../../styles/themeSelectors';

export const ToolBarGroupStyled = styled.div`
  display: flex;
  align-items: stretch;
  padding: 0 ${baseModule(1)}px;
  
  & + & {
    border-left: 1px solid ${constants.borderColor};    
  }
`;

ToolBarGroupStyled.displayName = 'ToolBarGroupStyled';
