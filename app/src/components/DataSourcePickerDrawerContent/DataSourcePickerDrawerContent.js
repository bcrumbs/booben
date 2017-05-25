'use strict';

import React from 'react';
import { Button } from '@reactackle/reactackle';
import { DataSourcePickerDrawerContentStyled }
  from './styles/DataSourcePickerDrawerContentStyled';
import { TitleStyled } from './styles/TitleStyled';
import { ButtonWrapperStyled } from './styles/ButtonWrapperStyled';

export const DataSourcePickerDrawerContent = () => (
  <DataSourcePickerDrawerContentStyled>
    <TitleStyled>
      Выберите источник данных
    </TitleStyled>
    <ButtonWrapperStyled>
      <Button text="Cancel" kind="flat" light size="small" />
    </ButtonWrapperStyled>
  </DataSourcePickerDrawerContentStyled>
);

DataSourcePickerDrawerContent.displayName = 'DataSourcePickerDrawerContent';
