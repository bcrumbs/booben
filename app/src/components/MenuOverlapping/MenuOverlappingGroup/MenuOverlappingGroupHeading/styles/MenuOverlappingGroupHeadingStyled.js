import styled from 'styled-components';

import {
  baseModule,
  fontSizeSmall,
  fontWeightSemibold,
  textColorMedium,
} from '../../../../../styles/themeSelectors';

export const MenuOverlappingGroupHeadingStyled = styled.div`
  color: ${textColorMedium};
  font-size: ${fontSizeSmall}px;
  line-height: 1.5;
  padding: ${baseModule(0.5)}px ${baseModule(1)}px;
  font-weight: ${fontWeightSemibold};
`;

MenuOverlappingGroupHeadingStyled.displayName =
  'MenuOverlappingGroupHeadingStyled';
