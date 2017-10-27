import React from 'react';
import { DataListStyled } from './styles/DataListStyled';

export const DataList = ({ children }) => (
  <DataListStyled>
    {children}
  </DataListStyled>
);

DataList.displayName = 'DataList';

export * from './DataItem/DataItem';
