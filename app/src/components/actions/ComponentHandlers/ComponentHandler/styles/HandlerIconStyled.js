'use strict';

import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';

const expanded = ({ expanded }) => expanded
  ? '> * { transform: rotate(90deg); }'
  : '';

export const HandlerIconStyled = styled.div`
  display: flex;
  ${expanded}
  ${transition('transform')}
`;

HandlerIconStyled.displayName = 'HandlerIconStyled';
