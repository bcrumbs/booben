'use strict';

import styled from 'styled-components';
import {
  baseModule,
  fontSizeSmall,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const SubtitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  line-height: 1.4;
  color: ${textColorMedium};
  text-align: left;
  margin-top: ${baseModule(0.5)}px;
`;

SubtitleStyled.displayName = 'SubtitleStyled';
