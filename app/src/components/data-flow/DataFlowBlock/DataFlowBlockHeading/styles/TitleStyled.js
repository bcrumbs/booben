import styled from 'styled-components';

import {
  fontSizeSmall,
  textColorMedium,
} from '../../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  color: ${textColorMedium};
`;

TitleStyled.displayName = 'TitleStyled';
