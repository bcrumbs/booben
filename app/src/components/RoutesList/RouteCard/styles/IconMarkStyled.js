import styled from 'styled-components';
import { iconSize } from '../../../../styles/mixins';
import constants from './constants';
import { textColorMedium } from '../../../../styles/themeSelectors';

const markSize = `${constants.markSize}px`;

export const IconMarkStyled = styled.div`
  color: ${textColorMedium};
  flex-shrink: 0;
  ${iconSize(markSize, markSize, `${constants.markImgSize}px`, 'font')}
`;

IconMarkStyled.displayName = 'IconMarkStyled';
