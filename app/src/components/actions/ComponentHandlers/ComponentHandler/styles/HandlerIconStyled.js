import styled, { css } from 'styled-components';
import { transition } from 'reactackle-core';
import { textColorMedium } from '../../../../../styles/themeSelectors';

const expanded = ({ expanded }) => expanded
  ? css`
    > * {
      transform: rotate(90deg);
      ${transition('transform')}
    }
  `
  : '';

export const HandlerIconStyled = styled.div`
  display: flex;
  color: ${textColorMedium};
  ${expanded}
`;

HandlerIconStyled.displayName = 'HandlerIconStyled';
