import styled from 'styled-components';
import { iconSizeMixin } from 'reactackle-core';
import constants from '../../../styles/constants';

import {
  textColorMediumDark,
} from '../../../../../styles/themeSelectors';

const iconSize = constants.buttonSize;
const iconImgSize = constants.buttonImgSize;

export const IconSlotStyled = styled.div`
  display: flex;
  color: ${textColorMediumDark};
  margin-right: -2px;
  
  ${iconSizeMixin(`${iconSize}px`, `${iconImgSize}px`)}
`;

IconSlotStyled.displayName = 'IconSlotStyled';
