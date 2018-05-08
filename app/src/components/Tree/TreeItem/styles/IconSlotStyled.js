import styled from 'styled-components';
import { iconSizeMixin } from 'reactackle-core';
import constants from '../../styles/constants';

import {
  baseModule,
  textColorMediumDark,
} from '../../../../styles/themeSelectors';

const iconSize = constants.buttonSize;

export const IconSlotStyled = styled.div`
  display: flex;
  color: ${textColorMediumDark};
  margin-left: ${baseModule(0.5)}px;
  
  ${iconSizeMixin(`${iconSize}px`)}
`;

IconSlotStyled.displayName = 'IconSlotStyled';
