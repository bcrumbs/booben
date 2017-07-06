'use strict';

import styled from 'styled-components';
import componentConstants from './constants';
import { baseModule } from '../../../styles/themeSelectors';

const itemPadX = componentConstants.item.paddingX;

export const DataListStyled = styled.div`
  margin: -${baseModule(1)}px -${itemPadX}px;
  margin-right: -${itemPadX}px;
  width: calc(100% + ${baseModule(4)}px);
`;

DataListStyled.displayName = 'DataListStyled';
