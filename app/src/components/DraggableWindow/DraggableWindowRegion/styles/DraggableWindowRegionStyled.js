'use strict';

import styled from 'styled-components';
import { boxShadow } from '../../../../styles/mixins';

import {
  paletteBlueGrey200,
  baseModule,
} from '../../../../styles/themeSelectors';

const shadowWidth = 2;

const typeAside = ({ type }) => type === 'aside'
  ? `
    background-color: ${paletteBlueGrey200};
    overflow: hidden;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      z-index: 1;
      top: -5%;
      bottom: -5%;
      left: -${shadowWidth}px;
      height: 110%;
      width: ${shadowWidth}px;
      box-shadow: 1px 0 6px 0 rgba(0,0,0,0.22);
    }
  `
  : '';

export const DraggableWindowRegionStyled = styled.div`
  width: 360px;
  min-height: 300px;
  flex-shrink: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  ${typeAside}
`;

DraggableWindowRegionStyled.displayName = 'DraggableWindowRegionStyled';
