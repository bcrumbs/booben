'use strict';

import React from 'react';
import { AppWrapperStyled } from './styles/AppWrapperStyled';

const propTypes = {};
const defaultProps = {};

export const AppWrapper = children => (
  <AppWrapperStyled>
    {children}
  </AppWrapperStyled>
);

AppWrapper.propTypes = propTypes;
AppWrapper.defaultProps = defaultProps;
AppWrapper.displayName = 'AppWrapper';
