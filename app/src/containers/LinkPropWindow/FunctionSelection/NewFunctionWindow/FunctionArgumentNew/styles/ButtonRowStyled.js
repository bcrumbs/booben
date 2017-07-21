'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../../../styles/themeSelectors';

const itemsSpacingX = baseModule(0.25);

export const ButtonRowStyled = styled.div`
  text-align: right;
  margin-right: -${itemsSpacingX}px;
  margin-bottom: -${itemsSpacingX}px;
  margin-top: ${baseModule(2)}px;
  
  & > * {
    margin: 0 ${itemsSpacingX}px;
  }
`;

ButtonRowStyled.displayName = 'ButtonRowStyled';
