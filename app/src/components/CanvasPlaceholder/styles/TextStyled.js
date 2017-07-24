'use strict';

import styled from 'styled-components';
import { textColorMedium, fontSizeHeadline } from '../../../styles/themeSelectors';

export const TextStyled = styled.div`
  color: ${textColorMedium};
  font-size: ${fontSizeHeadline}px;
  max-width: 24em;
  user-select: none;
`;

TextStyled.displayName = 'TextStyled';
