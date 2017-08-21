import React from 'react';
import { Button } from '@reactackle/reactackle';
import { ItemStyled } from './styles/ItemStyled';
import { ContentStyled } from './styles/ContentStyled';
import { ButtonStyled } from './styles/ButtonStyled';
import { TitleStyled } from './styles/TitleStyled';

export const BlockSelectionMenuItem = ({ children, title }) => (
  <ItemStyled>
    <ContentStyled>
      <TitleStyled>{title}</TitleStyled>
      {children}
    </ContentStyled>

    {children && (
      <ButtonStyled>
        <Button
          icon={{ name: 'chevron-down '}}
          radius="rounded"
          colorScheme="flatLight"
          size="small"
        />
      </ButtonStyled>
    )}
  </ItemStyled>
);

BlockSelectionMenuItem.displayName = 'BlockSelectionMenuItem';

