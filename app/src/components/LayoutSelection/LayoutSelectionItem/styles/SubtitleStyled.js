/**
 * @author Ekaterina Marova
 */

'use strict';

import styled from 'styled-components';

import {
  baseModule,
  fontSizeSmall,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const SubtitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  line-height: 1.5;
  color: ${textColorMedium};
  margin-top: ${baseModule(0.25)}px;
`;

SubtitleStyled.displayName = 'SubtitleStyled';
