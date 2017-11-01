import React from 'react';
import { ShortcutsListStyled } from './styles/ShortcutsListStyled';

export const ShortcutsList = ({ children }) => (
  <ShortcutsListStyled>
    {children}
  </ShortcutsListStyled>
);

ShortcutsList.displayName = 'ShortcutsList';
