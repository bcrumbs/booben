import styled from 'styled-components';
import { TreeItemStyled } from './TreeItemStyled';

const noSublevel = ({ noSublevel, theme }) => noSublevel
  ? `
    ${TreeItemStyled} ${TreeItemStyled} & {    
      padding-left:
        ${theme.reactackle.components.button.size.small.minHeight}px;
      }
    }
  `
  : '';

export const ItemContentStyled = styled.div`
  display: flex;
  align-items: center;
  max-width: 300px;
  ${noSublevel}
`;

ItemContentStyled.displayName = 'ItemContentStyled';
