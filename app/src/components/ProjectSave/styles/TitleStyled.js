'use strict';

import styled from 'styled-components';
import { fontSizeBody, baseModule } from '../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  color: inherit;
  font-size: ${fontSizeBody}px;
  white-space: nowrap;
  padding: ${baseModule(1)}px 0;
  display: flex;
  align-items: center;
`;

TitleStyled.displayName = 'TitleStyled';
