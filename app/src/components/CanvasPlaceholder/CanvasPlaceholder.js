'use strict';

import React from 'react';
import { CanvasPlaceholderStyled } from './styles/CanvasPlaceholderStyled';
import { ContentBoxStyled } from './styles/ContentBoxStyled';
import { TextStyled } from './styles/TextStyled';

export const CanvasPlaceholder = () => (
  <CanvasPlaceholderStyled>
    <ContentBoxStyled>
      <TextStyled>
        Drop here some component to start
      </TextStyled>
    </ContentBoxStyled>
  </CanvasPlaceholderStyled>
);
CanvasPlaceholder.displayName = 'CanvasPlaceholder';
