import React from 'react';
import { SelectionListStyled } from './styles/SelectionListStyled';

import {
  ComponentLayoutSelectionStyled,
} from './styles/ComponentLayoutSelectionStyled';

export const ComponentLayoutSelection = ({ children }) => (
  <ComponentLayoutSelectionStyled>
    <SelectionListStyled>
      {children}
    </SelectionListStyled>
  </ComponentLayoutSelectionStyled>
);

ComponentLayoutSelection.displayName = 'ComponentLayoutSelection';

export * from './ComponentLayoutSelectionItem/ComponentLayoutSelectionItem';
