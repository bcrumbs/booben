import styled from 'styled-components';
import constants from '../../../styles/constants';

export const HeadingStyled = styled.button`
  display: flex;
  align-items: flex-start;
  margin: 0;
  padding: ${constants.itemPadY}px ${constants.itemPadX}px 0;
  text-align: left;
  width: 100%;
  max-width: 100%;
  cursor: pointer;
  
  &,
  &:hover,
  &:focus {
    box-shadow: none;
    outline: none;
    border: 0 solid transparent;
    background: transparent;  
  }
`;

HeadingStyled.displayName = 'HeadingStyled';
