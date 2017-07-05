'use strict';

import styled from 'styled-components';

export const CanvasFrameStyled = styled.section`
  flex-grow: 1;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  min-height: 100vh;

  .panel-content & {
    height: auto;
    min-height: 0;
  }
  
  .display-flex { display: flex; }
`;

CanvasFrameStyled.displayName = 'CanvasFrameStyled';
