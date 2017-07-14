'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';
import { TreeItemStyled } from '../../ComponentsTreeItem/styles/TreeItemStyled';

export const TreeListStyled = styled.ul`
  margin: 0;
  list-style-type: none;
  padding: 0;
  
  ${TreeItemStyled} & {
    margin-top: ${baseModule(1)}px;
    margin-left: ${baseModule(2)}px;
    padding-right: 0;
  }
`;

TreeListStyled.displayName = 'TreeListStyled';
