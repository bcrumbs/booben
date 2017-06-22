'use strict';

import styled from 'styled-components';
import constants from './constants';

export const ActionIconStyled = styled.span`
  display: flex;
  margin-right: ${constants.iconTextSpacing}px;
  width: ${constants.headingIconSize}px;
  height: ${constants.headingIconSize}px;
  line-height: ${constants.headingIconSize}px;
  font-size: 16px;
`;

ActionIconStyled.displayName = 'ActionIconStyled';
