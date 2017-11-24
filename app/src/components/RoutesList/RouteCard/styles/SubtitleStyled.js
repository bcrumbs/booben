import styled from 'styled-components';

import {
  fontSizeSmall,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const SubtitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  line-height: 1.3;
  color: ${textColorMedium};
`;

SubtitleStyled.displayName = 'SubtitleStyled';
