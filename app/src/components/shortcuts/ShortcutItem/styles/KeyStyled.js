import styled from 'styled-components';

import {
  baseModule,
  fontWeightSemibold,
} from '../../../../styles/themeSelectors';

export const KeyStyled = styled.div`
  width: 150px;
  flex-shrink: 0;
  margin-right: ${baseModule(1.5)}px;
  font-weight: ${fontWeightSemibold};
  text-align: right;
`;

KeyStyled.displayName = 'KeyStyled';
