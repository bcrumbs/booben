'use strict';

import Color from 'color';

/**
 *
 * @type {Object<string, string>}
 */
const directionMap = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
  center: 'center',
  ltr: 'rtl',
  rtl: 'ltr',
};

/**
 *
 * @param {string} direction
 * @return {string}
 */
export const oppositeDirection = direction => directionMap[direction];

/**
 * Checks the lightness of `bgColor`, and if it passes the `threshold` of
 * lightness, it returns the `dark` color. Otherwise, it returns
 * the `light` color. Use this function to dynamically output a foreground color
 * based on a given background color.
 *
 * @param {string} bgColor - Color to check the lightness of.
 * @param {string} [dark='#000'] - Color to return if `bgColor` is light.
 * @param {string} [light='#fff'] - Color to return if `bgColor` is dark.
 * @param {number} [threshold=0.5] - Threshold of lightness to check against.
 * @return {string} The dark color or light color.
 */
export const foreground = (
  bgColor,
  dark = '#000',
  light = '#fff',
  threshold = 0.5,
) => Color(bgColor).luminosity() > threshold ? dark : light;
