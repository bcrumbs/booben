import styled from 'styled-components';
import constants from '../../../styles/constants';

import {
  baseModule,
  fontSizeBody,
} from '../../../../../../styles/themeSelectors';

export const PickViewStyled = styled.button`
  text-decoration: underline;
  font-size: ${fontSizeBody}px;
  padding: ${baseModule(1.5)}px ${constants.itemPadX}px;
  margin: 0;
  outline: none;
  box-shadow: none;
  border: 0;
  background: transparent;
  width: 100%;
  text-align: center;
  cursor: pointer;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
  }
`;

PickViewStyled.displayName = 'PickViewStyled';
