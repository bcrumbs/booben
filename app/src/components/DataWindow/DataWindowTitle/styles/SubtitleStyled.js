import styled from 'styled-components';

import {
  fontSizeBody2,
  textColorBody,
  baseModule,
} from '../../../../styles/themeSelectors';

export const SubtitleStyled = styled.div`
  font-size: ${fontSizeBody2}px;
  line-height: 1.25;
  color: ${textColorBody};

  * + & {
    margin-top: ${baseModule(2)}px;
  }
`;

SubtitleStyled.displayName = 'SubtitleStyled';
