import React from 'react';

import {
  PageDrawerActionPlaceholderStyled,
} from './styles/PageDrawerActionPlaceholderStyled';

import {
  PageDrawerActionPlaceholderBoxStyled,
} from './styles/PageDrawerActionPlaceholderBoxStyled';

export const PageDrawerActionPlaceholder = () => (
  <PageDrawerActionPlaceholderStyled>
    <PageDrawerActionPlaceholderBoxStyled />
  </PageDrawerActionPlaceholderStyled>
);

PageDrawerActionPlaceholder.displayName = 'PageDrawerActionPlaceholder';
