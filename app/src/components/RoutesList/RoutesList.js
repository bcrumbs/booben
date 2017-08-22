'use strict';

import React from 'react';
import { RoutesListStyled } from './styles/RoutesListStyled';

export const RoutesList = props => (
  <RoutesListStyled>
    {props.children}
  </RoutesListStyled>
);

RoutesList.displayName = 'RoutesList';

export * from './RoutesListWrapper/RoutesListWrapper';
export * from './RouteCard/RouteCard';
export * from './IndexRouteCard/IndexRouteCard';
export * from './RouteNewButton/RouteNewButton';
