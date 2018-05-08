import React from 'react';
import { TreeStyled } from './styles/TreeStyled';

export const Tree = props => (
  <TreeStyled>
    {props.children}
  </TreeStyled>
);
