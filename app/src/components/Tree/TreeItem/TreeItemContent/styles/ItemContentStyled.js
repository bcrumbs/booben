import styled, { css } from 'styled-components';
import constants from '../../../styles/constants';
import { textColorMedium } from '../../../../../styles/themeSelectors';

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
    }
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

export const ItemContentStyled = styled.div`
  display: flex;
  align-items: center;
  user-select: none;
  padding: 0 ${constants.itemPaddingX}px;
  position: relative;
  ${hovered}
  ${active}
  ${selected}
  ${disabled}
`;

ItemContentStyled.displayName = 'ItemContentStyled';
