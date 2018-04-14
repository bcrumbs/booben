import React from 'react';
import { BlockContentStyled } from './styles/BlockContentStyled';

export const BlockContent = props => (
  <BlockContentStyled>
    {props.children}
  </BlockContentStyled>
);

BlockContent.displayName = 'BlockContent';
