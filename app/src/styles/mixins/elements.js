import { css } from 'styled-components';

/*
 * type: font or image
 */
export const iconSize = (width, height, imgSize, type = 'font') => css`
  width: ${width};
  height: ${height};
  line-height: ${height};
  
  ${type === 'font'
    ? `font-size: ${imgSize};`
    : `background-size: ${imgSize};`
  }
`;
