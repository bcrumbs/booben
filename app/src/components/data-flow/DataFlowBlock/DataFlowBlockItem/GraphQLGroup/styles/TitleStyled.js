import styled from 'styled-components';

import {
  fontSizeBody,
  textColorBody,
  baseModule,
  fontWeightSemibold,
} from '../../../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeBody}px;
  color: ${textColorBody};
  margin-right: ${baseModule(1)}px;
  font-weight: ${fontWeightSemibold};
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

TitleStyled.displayName = 'TitleStyled';
