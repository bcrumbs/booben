import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';

import {
  radiusDefault,
  colorActiveBg,
} from '../../../../../styles/themeSelectors';

export const ActionLinkWrapperStyled = styled.a`
  display: flex;
  flex-grow: 1;
  border-radius: ${radiusDefault}px;
  cursor: pointer;
  ${transition('background-color')}

  &:hover {
    background-color: ${colorActiveBg};
  }
`;

ActionLinkWrapperStyled.displayName = 'ActionLinkWrapperStyled';
