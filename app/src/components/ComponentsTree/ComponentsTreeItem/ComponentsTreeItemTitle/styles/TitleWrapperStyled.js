import styled from 'styled-components';

export const TitleWrapperStyled = styled.button`
  &,
  &:hover,
  &:focus {
    background-color: transparent;
    border: 0 solid transparent;
    outline: none;
    box-shadow: none;
    padding: 0;
  }
`;

TitleWrapperStyled.displayName = 'TitleWrapperStyled';
