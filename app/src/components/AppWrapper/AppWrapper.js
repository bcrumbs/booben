import React from 'react';
import { AppWrapperStyled } from './styles/AppWrapperStyled';

export const AppWrapper = props => (
  <AppWrapperStyled>
    {props.children}
  </AppWrapperStyled>
);

AppWrapper.displayName = 'AppWrapper';
