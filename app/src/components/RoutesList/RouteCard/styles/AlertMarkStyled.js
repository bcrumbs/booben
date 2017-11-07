import styled from 'styled-components';
import { iconSize } from '../../../../styles/mixins';
import constants from './constants';
import { colorWhite, colorWarning } from '../../../../styles/themeSelectors';

const markSize = `${constants.markSize}px`;

export const AlertMarkStyled = styled.div`
  color: ${colorWhite};
  background-color: ${colorWarning};
  flex-shrink: 0;
  border-radius: 50%;
  ${iconSize(markSize, markSize, `${constants.markImgSize}px`, 'font')}
`;

AlertMarkStyled.displayName = 'AlertMarkStyled';
