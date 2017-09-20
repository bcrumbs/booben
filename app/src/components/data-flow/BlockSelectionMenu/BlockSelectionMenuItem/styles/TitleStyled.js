import styled from 'styled-components';

import {
  fontSizeBody,
  baseModule,
  radiusDefault,
} from '../../../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  font-size: ${fontSizeBody}px;
  padding: ${baseModule(0.5)}px ${baseModule(0.75)}px;
  border-radius: ${radiusDefault}px;
  cursor: pointer;
  
  &:hover,
  &:focus {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

TitleStyled.displayName = 'TitleStyled';
