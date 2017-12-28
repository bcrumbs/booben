import styled from 'styled-components';
import { iconSizeMixin } from '@reactackle/reactackle';
import constants from './constants';
import { colorWhite, colorWarning } from '../../../../styles/themeSelectors';

const markSize = `${constants.markSize}px`;

export const AlertMarkStyled = styled.div`
  color: ${colorWhite};
  background-color: ${colorWarning};
  flex-shrink: 0;
  border-radius: 50%;
  ${iconSizeMixin(markSize, `${constants.markImgSize}px`)}
  
  & > *,
  svg {
    width: ${markSize};
    height: ${markSize};
  }
`;

AlertMarkStyled.displayName = 'AlertMarkStyled';
