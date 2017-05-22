'use strict';

import styled from 'styled-components';
import {
  baseModule,
  fontWeightSemibold,
} from '../../../../styles/styleHelpers';

export const ParameterTitleStyled = styled.span`
  font-weight: ${fontWeightSemibold};
  margin-right: ${baseModule}px;
`;

ParameterTitleStyled.displayName = 'ParameterTitleStyled';
