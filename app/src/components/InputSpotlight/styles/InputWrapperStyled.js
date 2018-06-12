import styled from 'styled-components';

export const InputWrapperStyled = styled.div`
  width: 100%;
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  
  & > * {
    width: 100%;
  }
`;

InputWrapperStyled.displayName = 'InputWrapperStyled';
