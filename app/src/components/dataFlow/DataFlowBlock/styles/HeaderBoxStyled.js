import styled, { css } from 'styled-components';
import constants from '../../styles/constants';

import {
  baseModule,
} from '../../../../styles/themeSelectors';

const colorScheme = ({ colorScheme }) => css`
  background-color: ${constants.color[colorScheme]};
`;

export const HeaderBoxStyled = styled.div`
  width: 100%;
  position: relative;
  padding: ${baseModule(1)}px ${baseModule(1.5)}px;
  user-select: none;
  ${colorScheme}
`;

HeaderBoxStyled.displayName = 'HeaderBoxStyled';
