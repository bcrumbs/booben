import styled from 'styled-components';
import constants from '../../../styles/constants';
import { baseModule } from '../../../../../../styles/themeSelectors';

export const TableViewStyled = styled.table`
  width: 100%;
  max-width: 100%;  
  margin: ${constants.itemPadY}px 0;
  
  td {
    padding: ${baseModule(0.25)}px ${baseModule(0.5)}px;
  }
  
  td:first-child {
    padding-left: ${constants.itemPadX}px;
  }
  
  td:last-child {
    padding-right: ${constants.itemPadX}px;
  }
`;

TableViewStyled.displayName = 'TableViewStyled';
