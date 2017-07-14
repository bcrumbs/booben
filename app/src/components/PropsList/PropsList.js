/**
 * @author Ekaterina Marova
 */

'use strict';

import React from 'react';
import { PropsListStyled } from './styles/PropsListStyled';

export const PropsList = props => (
  <PropsListStyled>
    {props.children}
  </PropsListStyled>
);

PropsList.displayName = 'PropsList';

export * from './Prop/Prop';
