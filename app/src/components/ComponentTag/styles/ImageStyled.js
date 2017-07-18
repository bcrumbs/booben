'use strict';

import styled from 'styled-components';
import { paletteBlueGrey100 } from '../../../styles/themeSelectors';

export const ImageStyled = styled.picture`
  width: 100%;
  min-height: 90px;
  background-color: ${paletteBlueGrey100};
  display: flex;
  align-items: center;
  overflow: hidden;

  img {
    width: 100%;
    max-width: 100%;
  }
`;

ImageStyled.displayName = 'ImageStyled';
