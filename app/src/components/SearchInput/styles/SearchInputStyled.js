import styled from 'styled-components';
import { baseModule } from '../../../styles/themeSelectors';

export const SearchInputStyled = styled.div`
  display: flex;
  align-items: stretch;
  padding: 0 14px;
  
  input {
    height: 38px;
  }
  
  input + div {
    opacity: 0;
  }
  
  input:focus + div {
    opacity: 1;
  }
`;

SearchInputStyled.displayName = 'SearchInputStyled';
