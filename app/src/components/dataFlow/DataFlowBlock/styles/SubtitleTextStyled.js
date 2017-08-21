import styled from 'styled-components';

import {
  colorWhite,
  fontSizeSmall,
  baseModule,
} from '../../../../styles/themeSelectors';

export const SubtitleTextStyled = styled.span`
  color: ${colorWhite};
  opacity: 0.8;
  font-size: ${fontSizeSmall}px;
  line-height: 1.2;
  margin-right: ${baseModule(1)}px;
`;

SubtitleTextStyled.displayName = 'SubtitleTextStyled';
