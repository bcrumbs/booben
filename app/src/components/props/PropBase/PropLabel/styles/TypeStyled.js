'use strict';

import styled from 'styled-components';

import {
  fontSizeSmall,
  textColorMedium,
  baseModule,
} from '../../../../../styles/themeSelectors';

export const TypeStyled = styled.span`
  font-size: ${fontSizeSmall}px;
  color: ${textColorMedium};
  margin-right: ${baseModule(0.5)}px;
`;

TypeStyled.displayName = 'TypeStyled';
