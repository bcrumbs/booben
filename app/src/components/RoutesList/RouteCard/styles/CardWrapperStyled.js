'use strict';

import styled from 'styled-components';

import {
  baseModule,
  paletteBlueGrey400,
} from '../../../../styles/themeSelectors';

const verticalRuler = ({ focused }) => focused
  ? `
    + *::before {
      position: absolute;
      content: '';
      top: 0;
      left: -${baseModule(1)}px;
      height: 100%;
      width: 0;
      border-left: 1px solid ${paletteBlueGrey400};
      z-index: 1;      
    }
  `
  : '';

export const CardWrapperStyled = styled.div`
  & + & {
    margin-top: ${baseModule(1)}px;
  }

  ${verticalRuler}
`;

CardWrapperStyled.displayName = 'CardWrapperStyled';
