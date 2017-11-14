import styled from 'styled-components';

import {
  baseModule,
  fontSizeBody,
  fontWeightSemibold,
  textColorMedium,
} from '../../../../styles/themeSelectors';

export const GroupTitleStyled = styled.div`
  font-size: ${fontSizeBody}px;
  font-weight: ${fontWeightSemibold};
  margin-bottom: ${baseModule(0.5)}px;
  text-transform: uppercase;
  color: ${textColorMedium};
`;

GroupTitleStyled.displayName = 'GroupTitleStyled';
