import styled from 'styled-components';
import { iconSizeMixin } from 'reactackle-core';
import constants from './constants';
import { textColorMedium } from '../../../../../styles/themeSelectors';

export const ActionIconStyled = styled.span`
  display: flex;
  margin-right: ${constants.iconTextSpacing}px;
  color: ${textColorMedium};  
  ${iconSizeMixin(`${constants.headingIconSize}px`, '16px')}
`;

ActionIconStyled.displayName = 'ActionIconStyled';
