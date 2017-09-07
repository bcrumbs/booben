import React from 'react';
import { ButtonRowStyled } from './styles/ButtonRowStyled';

export const ComponentActionsButtonRow = props => (
  <ButtonRowStyled>
    {props.children}
  </ButtonRowStyled>
);

ComponentActionsButtonRow.displayName = 'ComponentActionsButtonRow';
