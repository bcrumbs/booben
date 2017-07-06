'use strict';

import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';
import { baseModule } from '../../../../styles/themeSelectors';

const my = 2,
  mx = 2;

const selected = ({ selected }) => selected
  ? `
    opacity: 1;
    pointer-events: initial;
    position: relative;
  `
  : '';

export const ButtonsStyled = styled.div`
  opacity: 0;
  pointer-events: none;
  position: fixed;
  margin: -${my}px -calc(${mx}px - ${baseModule(1)}px);
  width: calc(100% + ${mx * 2}px + ${baseModule(2)}px);
  text-align: right;
  ${selected}
  ${transition('opacity')};

  & > * {
      margin: ${my}px ${mx}px;
  }
`;

ButtonsStyled.displayName = 'ButtonsStyled';
