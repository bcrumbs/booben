/**
 * @author Ekaterina Marova
 */

import styled from 'styled-components';

import {
  baseModule,
  paletteBlueGrey50,
  textColorMedium,
  fontWeightSemibold,
  fontSizeXSmall,
} from '../../../../styles/themeSelectors';

export const GroupTitleStyled = styled.div`
  margin: 0;
  padding: ${baseModule(0.5)}px ${baseModule(1.5)}px;
  width: 100%;
  background-color: ${paletteBlueGrey50};
  text-transform: uppercase;
  color: ${textColorMedium};
  font-weight: ${fontWeightSemibold};
  font-size: ${fontSizeXSmall}px;
`;

GroupTitleStyled.displayName = 'GroupTitleStyled';
