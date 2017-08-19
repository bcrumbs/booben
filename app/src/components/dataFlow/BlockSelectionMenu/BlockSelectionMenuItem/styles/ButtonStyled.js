'use strict';

import styled from 'styled-components';

import {
  baseModule,
} from '../../../../../styles/themeSelectors';

export const ButtonStyled = styled.div`
  display: flex;
  margin-left: ${baseModule(1)}px;
  flex-shrink: 0;
`;

ButtonStyled.displayName = 'ButtonStyled';
