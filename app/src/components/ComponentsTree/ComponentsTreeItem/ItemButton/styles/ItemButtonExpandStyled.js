import styled, { css } from 'styled-components';
import { transition } from '@reactackle/reactackle';
import constants from '../../styles/constants';

import {
  textColorMedium,
} from '../../../../styles/themeSelectors';

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

const active = ({ active }) => active
  ? css`
    background-color: rgba(0, 0, 0, 0.15);
    cursor: default;
  `
  : '';

const selected = ({ selected }) => selected
  ? css`
    background-color: rgba(0, 0, 0, 0.2);
    cursor: default;
  `
  : '';

const disabled = ({ disabled }) => disabled
  ? disabledStyles
  : '';

// TODO remove this after fixing TreeItem & adding props
const temporary = () => `
  &:hover,
  &:focus {
    background-color: rgba(0, 0, 0, 0.15);    
  }
`;

export const ItemContentStyled = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${constants.itemPaddingX}px;
  ${temporary}
  ${hovered}
  ${active}
  ${selected}
  ${disabled}
  ${transition('background-color')}
`;

ItemContentStyled.displayName = 'ItemContentStyled';
