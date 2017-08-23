import React from 'react';
import { WrapperStyled } from './styles/WrapperStyled';

export const DataFlowWrapper = props => (
  <WrapperStyled>
    {props.children}
  </WrapperStyled>
);

DataFlowWrapper.displayName = 'DataFlowWrapper';
