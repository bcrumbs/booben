'use strict';

import styled from 'styled-components';
import {
  halfBaseModule,
  baseModule,
  fontSizeSmall,
  fontWeightSemibold,
  textColorMedium,
} from '../../../../../styles/themeSelectors';

export const MenuOverlappingGroupHeadingStyled = styled.div`
  color: ${textColorMedium};
  font-size: ${fontSizeSmall}px;
  line-height: 1.5;
  padding: ${halfBaseModule}px ${baseModule}px;
  font-weight: ${fontWeightSemibold};
`;

MenuOverlappingGroupHeadingStyled.displayName =
  'MenuOverlappingGroupHeadingStyled';
