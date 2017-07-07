'use strict';

import styled, { css } from 'styled-components';
import { transition } from '@reactackle/reactackle';
import componentDefaults from '../../../styles/constants';

import {
  baseModule,
  radiusDefault,
  textColorBody,
  fontSizeBody,
  paletteBlueGrey100,
  paletteBlueGrey400,
} from '../../../../../styles/themeSelectors';

const disabledStyles = css`
  &,
  &:hover,
  &:focus {
      color: ${paletteBlueGrey400};
      cursor: default;
  }
`;

const hovered = ({ hovered, disabled }) => {
  const disabledCase = disabled ? disabledStyles : '';
  
  return hovered
    ? `
      background-color: ${paletteBlueGrey100};
      ${disabledCase}
    `
    : '';
};

const disabled = ({ disabled }) => disabled
  ? disabledStyles
  : '';

export const TitleStyled = styled.div`
  padding: ${baseModule(0.5)}px ${baseModule(1)}px;
  border-radius: ${radiusDefault}px;
  color: ${textColorBody};
  font-size: ${fontSizeBody}px;
  line-height: 1.3;
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex-grow: 1;
  min-width: ${componentDefaults.item.minWIdth}px;
  overflow: hidden;
  text-align: left;
  ${transition('background-color')}
  ${hovered}
  ${disabled}
`;

TitleStyled.displayName = 'TitleStyled';
