'use strict';

import { css } from 'styled-components';

/*
 * type: font or image
 */
export const iconSize = (width, height, imgSize, type: 'font') => css`
  width: ${width};
  height: ${height};
  line-height: ${height};
  
  ${type === 'font'
    ? `font-size: ${imgSize};`
    : `background-size: ${imgSize};`
  }
`;

export const oppositeDirection = direction => {
  const directionMap = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
    center: 'center',
    ltr: 'rtl',
    rtl: 'ltr',
  };

  return directionMap[direction];
};

/**
 * Generate triangle
 * @param {string} direction - triangle direction
 * @param {string} [color='currentcolor'] - triangle color
 * @param {number} [width=1] - triangle width
 * @param {number} [height=width/2] - triangle height
 * @param {string} [unit='em'] - size unit
 */
export const triangle = (
  direction,
  color = 'currentcolor',
  width = 1,
  height = width / 2,
  unit = 'em',
) => {
  const perpendicularBorder = `${height + unit} solid transparent`;

  return css`
    width: 0;
    height: 0;
    
    border-${oppositeDirection(direction)}: ${height + unit} solid ${color};
    border-${direction}: 0 solid transparent;
    
    ${direction === 'top' || direction === 'bottom'
      ? `
        border-left: ${perpendicularBorder};
        border-right: ${perpendicularBorder};
      `
      : `
        border-top: ${perpendicularBorder};
        border-bottom: ${perpendicularBorder};
      `
    }
  `;
};
