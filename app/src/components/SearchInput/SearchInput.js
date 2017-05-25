'use strict';

import React from 'react';
import { Input, Button } from '@reactackle/reactackle';
import { SearchInputStyled } from './styles/SearchInputStyled';
import { InputWrapperStyled } from './styles/InputWrapperStyled';

export const SearchInput = () => (
  <SearchInputStyled>
    <InputWrapperStyled>
      <Input fullWidth placeholder="search component" />
    </InputWrapperStyled>
    <Button icon="search" />
  </SearchInputStyled>
);

SearchInput.displayName = 'SearchInput';
