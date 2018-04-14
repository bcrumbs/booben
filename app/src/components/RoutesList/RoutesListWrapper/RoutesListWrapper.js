import React from 'react';
import { RoutesListWrapperStyled } from './styles/RoutesListWrapperStyled';

export const RoutesListWrapper = props => (
  <RoutesListWrapperStyled>
    {props.children}
  </RoutesListWrapperStyled>
);

RoutesListWrapper.displayName = 'RoutesListWrapper';
