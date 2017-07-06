'use strict';

import React from 'react';
import { LayoutSelectionStyled } from './styles/LayoutSelectionStyled';
import { SelectionListStyled } from './styles/SelectionListStyled';
import './LayoutSelection.scss';

export const LayoutSelection = props => (
  <LayoutSelectionStyled>
    <SelectionListStyled>
      {props.children}
    </SelectionListStyled>
  </LayoutSelectionStyled>
);

LayoutSelection.displayName = 'LayoutSelection';

export * from './LayoutSelectionItem/LayoutSelectionItem';
