'use strict';

import styled from 'styled-components';
import { iconSize } from '../../../../styles/mixins';

import {
  baseModule,
  colorWhite,
  colorWarning,
} from '../../../../styles/themeSelectors';

const markSize = '20px';

export const AlertMarkStyled = styled.div`
  margin-left: ${baseModule(1)}px;
  margin-right: -${baseModule(1)}px;
  color: ${colorWhite};
  background-color: ${colorWarning};
  flex-shrink: 0;
  border-radius: 50%;
  ${iconSize(markSize, markSize, '11px', 'font')}
`;

AlertMarkStyled.displayName = 'AlertMarkStyled';
