import React from 'react';
import { Button } from '@reactackle/reactackle';
import { DataWindowBigButtonStyled } from './styles/DataWindowBigButtonStyled';

export const DataWindowBigButton = props => (
  <DataWindowBigButtonStyled>
    <Button
      radius="none"
      colorScheme="primary"
      text="Edit with DataFlow"
      icon={{ name: 'compass' }}
    />
  </DataWindowBigButtonStyled>
);

DataWindowBigButton.displayName = 'DataWindowBigButton';
