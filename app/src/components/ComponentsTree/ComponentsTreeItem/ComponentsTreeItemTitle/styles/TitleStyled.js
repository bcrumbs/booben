import styled, { css } from 'styled-components';

import {
  baseModule,
  radiusDefault,
  textColorMedium,
  textColorBody,
  fontSizeBody,
} from '../../../../../styles/themeSelectors';

const disabled = ({ disabled }) => disabled
  ? css`
    &,
    &:hover,
    &:focus {
      color: ${textColorMedium};
      cursor: default;
    }
  `
  : '';

export const TitleStyled = styled.div`
  padding: ${baseModule(0.75)}px 0;
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
  ${disabled}
`;

TitleStyled.displayName = 'TitleStyled';
