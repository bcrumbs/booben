'use strict';

import styled from 'styled-components';

import {
  fontSizeDisplay1,
  textColorBody,
  fontWeightNormal,
} from '../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeDisplay1}px;
  line-height: 1.25;
  color: ${textColorBody};
  font-weight: ${fontWeightNormal};
`;

TitleStyled.displayName = 'TitleStyled';
