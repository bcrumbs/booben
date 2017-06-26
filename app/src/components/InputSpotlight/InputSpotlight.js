/**
 * @author Dmitriy Bizyaev, Ekaterina Marova
 */

'use strict';

import React from 'react';
import { Input, Theme } from '@reactackle/reactackle';
import { InputSpotlightStyled } from './styles/InputSpotlightStyled';
import { ContentStyled } from './styles/ContentStyled';
import { InputWrapperStyled } from './styles/InputWrapperStyled';
import { OptionsWrapperStyled } from './styles/OptionsWrapperStyled';
import { inputMixin } from './styles/theme';

// TODO mixin не срабатывает
// TODO <Input /> надо обернуть в Theme
// TODO <Input /> должен автоматически получать фокус при открытии
export const InputSpotlight = ({ children }) => (
  <InputSpotlightStyled>
    <ContentStyled>
      <InputWrapperStyled>
        <Input fullWidth placeholder="Enter component's title" />
      </InputWrapperStyled>
      
      {children && <OptionsWrapperStyled>{children}</OptionsWrapperStyled>}
      
    </ContentStyled>
  </InputSpotlightStyled>
);

InputSpotlight.displayName = 'InputSpotlight';
