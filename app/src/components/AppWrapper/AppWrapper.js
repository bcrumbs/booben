'use strict';

import React from 'react';
import { AppWrapperStyled } from './styles/AppWrapperStyled';

const AppWrapper = props => (
  <AppWrapperStyled>
    {props.children}
  </AppWrapperStyled>
);

AppWrapper.displayName = 'AppWrapper';
