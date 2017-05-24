'use strict';

import styled from 'styled-components';
import {
  fontSizeXSmall,
  textColorMedium,
} from '../../../../../styles/themeSelectors';

const disabled = ({ disabled }) => disabled ? 'opacity: 0.75;' : '';

export const ItemTypeStyled = styled.span`
  font-size: ${fontSizeXSmall}px;
  color: ${textColorMedium};
  line-height: 1.5;
  margin-right: 0.3em;
  
  ${disabled}
`;

ItemTypeStyled.displayName = 'ItemTypeStyled';
