/**
 * @author Dmitriy Bizyaev, Ekaterina Marova
 */

import React from 'react';
import { OptionsListStyled } from './styles/OptionsListStyled';

export const OptionsList = ({ children }) => (
  <OptionsListStyled>{children}</OptionsListStyled>
);

OptionsList.displayName = 'OptionsList';
