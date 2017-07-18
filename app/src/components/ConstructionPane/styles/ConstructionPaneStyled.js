'use strict';

import styled from 'styled-components';
import { paletteBlueGrey100 } from '../../../styles/themeSelectors';

export const ConstructionPaneStyled = styled.div`
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  flex-grow: 1;
  position: absolute;
  background-color: ${paletteBlueGrey100};
`;

ConstructionPaneStyled.displayName = 'ConstructionPaneStyled';
