'use strict';

import styled from 'styled-components';
import {
  fontSizeBody,
  fontWeightNormal,
  textColorBody,
} from '../../../../../styles/themeSelectors';

export const LabelStyled = styled.label`
  flex-grow: 1;
  font-size: ${fontSizeBody}px;
  line-height: 1.2;
  font-weight: ${fontWeightNormal};
  color: ${textColorBody};
  display: flex;
  margin-bottom: 0;
  position: relative;
  align-items: center;
  user-select: none;
`;

LabelStyled.displayName = 'LabelStyled';
