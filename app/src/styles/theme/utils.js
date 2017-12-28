import Color from 'color';

/**
 * Checks the lightness of `bgColor`, and if it passes the `threshold` of
 * lightness, it returns the `dark` color. Otherwise, it returns
 * the `light` color. Use this function to dynamically output a foreground color
 * based on a given background color.
 *
 * @param {string} bgColor - Color to check the lightness of.
 * @param {string} dark - Color to return if `bgColor` is light.
 * @param {string} light - Color to return if `bgColor` is dark.
 * @param {number} threshold - Threshold of lightness to check against.
 * @return {string} The dark color or light color.
 */
export const foreground = (
  bgColor,
  dark = '#212121',
  light = '#ffffff',
  threshold = 0.5,
) => Color(bgColor).luminosity() > threshold ? dark : light;
