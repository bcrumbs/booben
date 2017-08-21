import React from 'react';
import { NodeGroupStyled } from './styles/NodeGroupStyled';

export const NodeGroup = props => (
  <NodeGroupStyled>
    {props.children}
  </NodeGroupStyled>
);

NodeGroup.displayName = 'NodeGroup';
