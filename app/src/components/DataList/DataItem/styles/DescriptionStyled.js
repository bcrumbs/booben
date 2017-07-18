'use strict';

import styled from 'styled-components';

import {
  baseModule,
  fontSizeSmall,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const DescriptionStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  line-height: 1.5;
  color: ${textColorMedium};
  margin-top: ${baseModule(0.5)}px;
`;

DescriptionStyled.displayName = 'DescriptionStyled';
