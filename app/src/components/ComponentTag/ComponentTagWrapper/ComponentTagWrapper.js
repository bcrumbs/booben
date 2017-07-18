'use strict';

import React from 'react';
import { TagWrapperStyled } from './styles/TagWrapperStyled';

export const ComponentTagWrapper = props => (
  <TagWrapperStyled>
    {props.children}
  </TagWrapperStyled>
);

ComponentTagWrapper.displayName = 'ComponentTagWrapper';
