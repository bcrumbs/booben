import React from 'react';
import { RouteParametersListStyled } from './styles/RouteParametersListStyled';

export const RouteParametersList = props => (
  <RouteParametersListStyled>
    {props.children}
  </RouteParametersListStyled>
);

RouteParametersList.displayName = 'RouteParametersList';

export * from './RouteParameter/RouteParameter';
