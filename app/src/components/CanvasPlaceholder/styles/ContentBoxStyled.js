'use strict';

import styled from 'styled-components';
import { paletteBlueGrey25, baseModule } from '../../../styles/themeSelectors';

export const ContentBoxStyled = styled.div`
  background-color: ${paletteBlueGrey25};
  padding: ${baseModule(3)}px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

ContentBoxStyled.displayName = 'ContentBoxStyled';
