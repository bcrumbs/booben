'use strict';

import styled from 'styled-components';

import {
  fontSizeSmall,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const MessageBoxStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  color: ${textColorMedium};
  line-height: 1.25;
`;

MessageBoxStyled.displayName = 'MessageBoxStyled';
