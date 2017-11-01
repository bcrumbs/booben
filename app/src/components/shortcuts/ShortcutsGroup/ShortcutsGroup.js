import React from 'react';
import { ShortcutsGroupStyled } from './styles/ShortcutsGroupStyled';
import { GroupTitleStyled } from './styles/GroupTitleStyled';
import { ItemsWrapperStyled } from './styles/ItemsWrapperStyled';

export const ShortcutsGroup = ({ children, title }) => (
  <ShortcutsGroupStyled>
    {title && <GroupTitleStyled>{title}</GroupTitleStyled>}

    <ItemsWrapperStyled>
      {children}
    </ItemsWrapperStyled>
  </ShortcutsGroupStyled>
);

ShortcutsGroup.displayName = 'ShortcutsGroup';
