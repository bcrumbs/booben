'use strict';

import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';

const expanded = ({
  expanded,
}) => `transform: rotate(${expanded ? 180 : 0}deg);`;

export const IconStyled = styled.div`
  display: flex;
  ${expanded}
  ${transition('transform')};
`;

IconStyled.displayName = 'IconStyled';
