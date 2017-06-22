'use strict';

import styled, { css } from 'styled-components';

import {
  fontSizeBody,
  textColorMedium,
  textColorBody,
  fontWeightSemibold,
} from '../../../../../styles/themeSelectors';

const active = ({ active }) => active
  ? css`
    color: ${textColorBody};
    font-weight: ${fontWeightSemibold};  
  `
  : '';

export const HandlerTitleStyled = styled.div`
  flex-grow: 1;
  font-size: ${fontSizeBody}px;
  line-height: 1.5;
  color: ${textColorMedium};
  padding: 6px 0;
  ${active}
`;

HandlerTitleStyled.displayName = 'HandlerTitleStyled';
