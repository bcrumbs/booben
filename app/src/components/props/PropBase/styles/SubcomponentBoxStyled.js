'use strict';

import styled from 'styled-components';
import constants from '../../styles/constants';

export const SubcomponentBoxStyled = styled.div`
  display: flex;
  align-items: center;
  max-height: ${constants.item.baseHeight}px;
`;

SubcomponentBoxStyled.displayName = 'SubcomponentBoxStyled';
