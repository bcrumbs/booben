'use strict';

import styled from 'styled-components';

import {
  colorWhite,
  fontSizeSmall,
  fontWeightSemibold,
} from '../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  color: ${colorWhite};
  font-size: ${fontSizeSmall}px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${fontWeightSemibold};
`;

TitleStyled.displayName = 'TitleStyled';
