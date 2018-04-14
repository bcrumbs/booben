import styled from 'styled-components';

export const HandlerStyled = styled.div`
  &,
  &:hover,
  &:focus {
    box-shadow: none;
    outline: none;
    background-color: transparent;
    padding: 0;
    margin: 0;
    width: 100%;
    border: 0;
    text-align: left;
    cursor: pointer;
  }
`;

HandlerStyled.displayName = 'HandlerStyled';
