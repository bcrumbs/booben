import styled from 'styled-components';

import {
  colorWhite,
  fontSizeSmall,
} from '../../../../styles/themeSelectors';

export const SubtitleStyled = styled.div`
  color: ${colorWhite};
  opacity: 0.8;
  font-size: ${fontSizeSmall}px;
  line-height: 1.2;
`;

SubtitleStyled.displayName = 'SubtitleStyled';
