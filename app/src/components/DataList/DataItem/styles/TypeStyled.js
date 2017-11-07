import styled from 'styled-components';

import {
  baseModule,
  fontSizeSmall,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const TypeStyled = styled.span`
  font-size: ${fontSizeSmall}px;
  line-height: 1.5;
  color: ${textColorMedium};
  margin-top: ${baseModule(0.5)}px;
  margin-right: ${baseModule(0.5)}px;
`;

TypeStyled.displayName = 'TypeStyled';
