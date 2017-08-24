'use strict';

import styled from 'styled-components';

import {
  baseModule,
} from '../../../../styles/themeSelectors';

export const CardWrapperStyled = styled.div`
  & + & {
    margin-top: ${baseModule(1)}px;
  }
`;

CardWrapperStyled.displayName = 'CardWrapperStyled';
