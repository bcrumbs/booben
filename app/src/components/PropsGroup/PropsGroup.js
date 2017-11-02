import React from 'react';
import { Accordion } from '@reactackle/reactackle';
import { PropsGroupStyled } from './styles/PropsGroupStyled';

export const PropsGroup = props => (
  <PropsGroupStyled>
    <Accordion {...props} />
  </PropsGroupStyled>
);

PropsGroup.displayName = 'PropsGroup';
