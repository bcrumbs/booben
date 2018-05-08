import styled from 'styled-components';
import { bodyFontFamily } from '../../../../../styles/themeSelectors';

export const TitleWrapperStyled = styled.div`
  font-family: ${bodyFontFamily};
  max-width: 100%;
  min-width: 0;
  
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
