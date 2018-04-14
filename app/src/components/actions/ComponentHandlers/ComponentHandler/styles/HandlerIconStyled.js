import styled, { css } from 'styled-components';
import { textColorMedium } from '../../../../../styles/themeSelectors';

const expanded = ({ expanded }) => expanded
  ? css`
    > * {
      transform: rotate(90deg);
    }
  `
  : '';

export const HandlerIconStyled = styled.div`
  display: flex;
  color: ${textColorMedium};
  ${expanded}
`;

HandlerIconStyled.displayName = 'HandlerIconStyled';
