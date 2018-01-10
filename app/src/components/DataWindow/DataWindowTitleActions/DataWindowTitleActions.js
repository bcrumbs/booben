import React from 'react';

import {
  DataWindowTitleActionsStyled,
} from './styles/DataWindowTitleActionsStyled';

export const DataWindowTitleActions = ({ children }) => (
  <DataWindowTitleActionsStyled>
    {children}
  </DataWindowTitleActionsStyled>
);

DataWindowTitleActions.displayName = 'DataWindowTitleActions';
