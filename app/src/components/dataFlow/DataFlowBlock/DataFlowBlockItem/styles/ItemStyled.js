'use strict';

import styled from 'styled-components';

import {
  baseModule,
} from '../../../../../styles/themeSelectors';

export const ItemStyled = styled.div`
  position: relative;
  padding: ${baseModule(1.5)}px;
`;

ItemStyled.displayName = 'ItemStyled';
