'use strict';

import styled from 'styled-components';

export const FrameStyled = styled.iframe`
  flex-grow: 1;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  border: 0;
  min-height: 100vh;

  .panel-content & {
    min-height: 0;
  }
`;

FrameStyled.displayName = 'FrameStyled';
