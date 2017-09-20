import styled from 'styled-components';

import {
  fontSizeBody,
  textColorBody,
  fontWeightSemibold,
} from '../../../../../../styles/themeSelectors';

export const NameStyled = styled.div`
  font-size: ${fontSizeBody}px;
  color: ${textColorBody};
  font-weight: ${fontWeightSemibold};
`;

NameStyled.displayName = 'NameStyled';
