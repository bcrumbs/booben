'use strict';

import styled from 'styled-components';
import constants from '../../styles/constants';

export const ToolBarActionStyled = styled.div`
  display: flex;
  align-items: stretch;
  opacity: 1;
  
  & > * {
    min-width: ${constants.height}px;
  }
`;

ToolBarActionStyled.displayName = 'ToolBarActionStyled';
