/**
 * @author Ekaterina Marova
 */

'use strict';

import styled from 'styled-components';

import {
  fontSizeBody,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeBody}px;
  line-height: 1.3;
`;

TitleStyled.displayName = 'TitleStyled';
