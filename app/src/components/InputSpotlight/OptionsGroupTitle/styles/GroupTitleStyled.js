/**
 * @author Ekaterina Marova
 */

'use strict';

import styled from 'styled-components';

import {
  baseModule,
  paletteBlueGrey50,
  textColorMedium,
  fontWeightSemibold,
  fontSizeXSmall,
} from '../../../../styles/themeSelectors';

import { inputSpotlightTheme } from '../../styles/theme';

export const GroupTitleStyled = styled.div`
  margin: 0;
  padding: ${baseModule(0.5)}px ${inputSpotlightTheme.options.paddingX}px;
  width: 100%;
  background-color: ${paletteBlueGrey50};
  text-transform: uppercase;
  color: ${textColorMedium};
  font-weight: ${fontWeightSemibold};
  font-size: ${fontSizeXSmall}px;
`;

GroupTitleStyled.displayName = 'GroupTitleStyled';
