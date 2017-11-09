import React from 'react';
import { HandlersStyled } from './styles/HandlersStyled';

export const ComponentHandlers = props => (
  <HandlersStyled>
    {props.children}
  </HandlersStyled>
);

ComponentHandlers.displayName = 'ComponentHandlers';

export * from './ComponentHandler/ComponentHandler';
