import React from 'react';
import { ContentStyled } from './styles';

export const Content = props => (
  <ContentStyled>{props.children}</ContentStyled>
);
