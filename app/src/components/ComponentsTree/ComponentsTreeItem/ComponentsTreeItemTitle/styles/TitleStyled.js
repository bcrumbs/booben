import styled, { css } from 'styled-components';
import { transition } from 'reactackle-core';

import {
  baseModule,
  radiusDefault,
  textColorBody,
  fontSizeBody,
  colorActiveBgLight,
  textColorMedium,
} from '../../../../../styles/themeSelectors';

const disabledStyles = css`
  &,
  &:hover,
  &:focus {
    color: ${textColorMedium};
    cursor: default;
  }
`;

const hovered = ({ hovered, active, disabled }) => {
  const disabledCase = disabled ? disabledStyles : '';

  return hovered && !active
    ? css`
      &,
      &:hover {
        background-color: rgba(0, 0, 0, 0.15);
      }
      
      ${disabledCase}
    `
    : '';
};

const active = ({ active, disabled }) => {
  const disabledCase = disabled ? disabledStyles : '';

  return active
    ? css`
      background-color: ${colorActiveBgLight};
      cursor: default;
      ${disabledCase}
    `
    : '';
};

const disabled = ({ disabled }) => disabled
  ? disabledStyles
  : '';

export const TitleStyled = styled.div`
  padding: ${baseModule(0.75)}px ${baseModule(1)}px;
  border-radius: ${radiusDefault}px;
  color: ${textColorBody};
  font-size: ${fontSizeBody}px;
  line-height: 1.3;
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex-grow: 1;
  min-width: 100px;
  overflow: hidden;
  text-align: left;
  ${transition('background-color')}
  ${hovered}
  ${active}
  ${disabled}
`;

TitleStyled.displayName = 'TitleStyled';
