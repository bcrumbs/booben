import styled from 'styled-components';

import {
  fontSizeBody2,
  textColorBody,
  fontWeightSemibold,
} from '../../../../../styles/themeSelectors';

export const NameStyled = styled.div`
  font-size: ${fontSizeBody2}px;
  color: ${textColorBody};
  font-weight: ${fontWeightSemibold};
`;

NameStyled.displayName = 'NameStyled';
