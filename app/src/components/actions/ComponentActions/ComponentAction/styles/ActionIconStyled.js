import styled from 'styled-components';
import constants from './constants';
import { textColorMedium } from '../../../../../styles/themeSelectors';

export const ActionIconStyled = styled.span`
  display: flex;
  margin-right: ${constants.iconTextSpacing}px;
  width: ${constants.headingIconSize}px;
  height: ${constants.headingIconSize}px;
  line-height: ${constants.headingIconSize}px;
  font-size: 16px;
  color: ${textColorMedium};
`;

ActionIconStyled.displayName = 'ActionIconStyled';
