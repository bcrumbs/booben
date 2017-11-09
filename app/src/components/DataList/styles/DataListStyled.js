import styled from 'styled-components';
import componentConstants from './constants';
import { baseModule } from '../../../styles/themeSelectors';

const itemPadX = componentConstants.item.paddingX;

export const DataListStyled = styled.div`
  margin: -${baseModule(1)}px -${itemPadX}px;
  width: calc(100% + ${itemPadX}px * 2);
`;

DataListStyled.displayName = 'DataListStyled';
