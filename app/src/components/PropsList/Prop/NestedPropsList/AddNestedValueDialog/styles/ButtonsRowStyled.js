'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../../../styles/themeSelectors';

export const ButtonsRowStyled = styled.div`
  margin-right: -${baseModule(1)}px;
  margin-bottom: -${baseModule(1)}px;
  text-align: right;
  margin-top: ${baseModule(2)}px;
`;

ButtonsRowStyled.displayName = 'ButtonsRowStyled';
