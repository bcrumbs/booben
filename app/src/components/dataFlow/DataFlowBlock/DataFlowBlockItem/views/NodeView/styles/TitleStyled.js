'use strict';

import styled from 'styled-components';

import {
  fontSizeBody,
  textColorBody,
} from '../../../../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeBody}px;
  color: ${textColorBody};
`;

TitleStyled.displayName = 'TitleStyled';
