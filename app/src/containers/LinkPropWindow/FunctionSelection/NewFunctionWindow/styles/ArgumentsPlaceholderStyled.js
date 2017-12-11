import styled from 'styled-components';

import {
  baseModule,
  textColorMedium,
} from '../../../../../styles/themeSelectors';

export const ArgumentsPlaceholderStyled = styled.div`
  color: ${textColorMedium};
  margin-bottom: ${baseModule(1)}px;
`;

ArgumentsPlaceholderStyled.displayName = 'ArgumentsPlaceholderStyled';
