'use strict';

import styled from 'styled-components';

import {
  fontSizeXSmall,
  textColorMedium,
  fontWeightSemibold,
} from '../../../../../../styles/themeSelectors';

export const CaseTitleStyled = styled.div`
  flex-grow: 1;
  font-size: ${fontSizeXSmall}px;
  color: ${textColorMedium};
  text-transform: uppercase;
  font-weight: ${fontWeightSemibold};
`;

CaseTitleStyled.displayName = 'CaseTitleStyled';
