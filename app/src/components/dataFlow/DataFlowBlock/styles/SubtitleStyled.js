'use strict';

import styled from 'styled-components';

import {
  colorWhite,
  fontSizeSmall,
} from '../../../../styles/themeSelectors';

export const SubtitleStyled = styled.div`
  color: ${colorWhite};
  opacity: 0.8;
  font-size: ${fontSizeSmall}px;
`;

SubtitleStyled.displayName = 'SubtitleStyled';
