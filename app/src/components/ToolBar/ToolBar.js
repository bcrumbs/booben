import React from 'react';
import { Theme } from '@reactackle/reactackle';
import reactackleThemeMixin from './styles/reactackle-theme-mixin';
import { ToolbarStyled } from './styles/ToolbarStyled';

export const ToolBar = ({ children }) => (
  <Theme mixin={reactackleThemeMixin}>
    <ToolbarStyled>
      {children}
    </ToolbarStyled>
  </Theme>
);

ToolBar.displayName = 'ToolBar';

export * from './ToolBarGroup/ToolBarGroup';
export * from './ToolBarAction/ToolBarAction';
