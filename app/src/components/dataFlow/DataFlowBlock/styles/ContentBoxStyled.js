'use strict';

import styled from 'styled-components';

import {
  baseModule,
  textColorBody,
  fontSizeBody,
} from '../../../../styles/themeSelectors';

export const ContentBoxStyled = styled.div`
  width: 100%;
  color: ${textColorBody};
  font-size: ${fontSizeBody}px;
  padding: ${baseModule(1)}px 0;
  
  &:empty {
    padding: 0;
  }
`;

ContentBoxStyled.displayName = 'ContentBoxStyled';
