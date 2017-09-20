import styled from 'styled-components';

import {
  colorBorder,
  baseModule,
} from '../../../../../../styles/themeSelectors';

export const TypeStyled = styled.div`
  border-bottom: 1px solid ${colorBorder};
  margin-bottom: ${baseModule(1)}px;
`;

TypeStyled.displayName = 'TypeStyled';
