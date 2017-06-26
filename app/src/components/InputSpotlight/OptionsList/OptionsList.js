/**
 * @author Dmitriy Bizyaev, Ekaterina Marova
 */

'use strict';

import React from 'react';
import { OptionsListStyled } from './styles/OptionsListStyled';

export const OptionsList = ({ children }) => (
  <OptionsListStyled>{children}</OptionsListStyled>
);

OptionsList.displayName = 'OptionsList';
