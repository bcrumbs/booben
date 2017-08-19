'use strict';

import styled from 'styled-components';
import constants from './constants';

import {
  baseModule,
} from '../../../styles/themeSelectors';

export const HeaderBoxStyled = styled.div`
  border-bottom: 1px solid ${constants.borderColor};
  padding: ${baseModule(0.5)}px ${baseModule(1.5)}px;
  display: flex;
  align-items: center;
`;

HeaderBoxStyled.displayName = 'HeaderBoxStyled';
