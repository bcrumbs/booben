import React from 'react';
import { ShortcutItemStyled } from './styles/ShortcutItemStyled';
import { KeyStyled } from './styles/KeyStyled';
import { DescriptionStyled } from './styles/DescriptionStyled';

export const ShortcutItem = ({ shortcut, description }) => (
  <ShortcutItemStyled>
    <KeyStyled>{shortcut}</KeyStyled>
    <DescriptionStyled>{description}</DescriptionStyled>
  </ShortcutItemStyled>
);

ShortcutItem.displayName = 'ShortcutItem';
