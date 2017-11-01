import styled from 'styled-components';

import {
  baseModule,
  fontWeightSemibold,
} from '../../../../styles/themeSelectors';

export const KeyStyled = styled.div`
  width: 100px;
  flex-shrink: 0;
  margin-right: ${baseModule(2)}px;
  font-weight: ${fontWeightSemibold};
  text-align: right;
`;

KeyStyled.displayName = 'KeyStyled';
