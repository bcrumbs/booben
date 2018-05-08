import styled from 'styled-components';
import constants from '../../styles/constants';

export const ButtonStyled = styled.button`
  display: flex;
  flex-grow: 1;
  align-items: center;
  cursor: pointer;
  padding: 0 ${constants.basePaddingX}px;
  font-size: ${constants.title.fontSize}px;
  min-width: 0;
  
  &,
  &:hover,
  &:focus {
    outline: none;
    box-shadow: none;
    border: 0;
    background-color: transparent;
    color: currentColor;
  }
`;
