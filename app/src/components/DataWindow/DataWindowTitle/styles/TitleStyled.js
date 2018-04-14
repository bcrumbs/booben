import styled from 'styled-components';

import {
  fontSizeHeadline,
  textColorBody,
  fontWeightNormal,
} from '../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeHeadline}px;
  line-height: 1.25;
  color: ${textColorBody};
  font-weight: ${fontWeightNormal};
`;

TitleStyled.displayName = 'TitleStyled';
