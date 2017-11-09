import styled from 'styled-components';
import constants from '../../../styles/constants';

import {
  radiusDefault,
  colorBorderDark,
} from '../../../../../styles/themeSelectors';

const placeholderSize = constants.placeholderSize;

export const PageDrawerActionPlaceholderBoxStyled = styled.div`  
  border-radius: ${radiusDefault}px;
  width: ${placeholderSize}px;
  height: ${placeholderSize}px;
  background-color: ${constants.actions.placeholder.bgColor};
  border: 1px solid ${colorBorderDark};
`;

PageDrawerActionPlaceholderBoxStyled.displayName =
  'PageDrawerActionPlaceholderBoxStyled';
