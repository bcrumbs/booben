import Color from 'color';

export const stripUnit = value => {
  if (!value) throw new TypeError('Value is not defined');
  
  if (typeof value === 'string')
    return value.match(/^\d+/)[0];
  else if (isFinite(value))
    return value;
  
  throw new TypeError('Wrong value type');
};

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
// console.log(oppositeDirection('top')); // bottom

export const legacyDirection = direction => {
  const directionMap = {
    'to top': 'bottom',
    'to top right': 'bottom left',
    'to right top': 'left bottom',
    'to right': 'left',
    'to bottom right': 'top left',
    'to right bottom': 'left top',
    'to bottom': 'top',
    'to bottom left': 'top right',
    'to left bottom': 'right top',
    'to left': 'right',
    'to left top': 'right bottom',
    'to top left': 'bottom right',
  };
  
  if (!directionMap[direction.toLowerCase()])
    throw new TypeError(`Wrong direction value: '${direction}'`);
  
  return directionMap[direction.toLowerCase()];
};
// console.log(legacyDirection('to top'));
// console.log(legacyDirection('to TOP'));
// console.log(legacyDirection('to penguin'));

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
  dark = '#000',
  light = '#fff',
  threshold = 0.5,
) => Color(bgColor).luminosity() > threshold ? dark : light;

// console.log(foreground('#ccc'));
// console.log(foreground('#333'));

/**
 * Generate columns
 */
export const column = (
  amount,
  totalColumns = 12,
) => {
  if (!isFinite(amount) || !isFinite(totalColumns))
    throw new TypeError('Wrong value type. Number expected.');
  
  const result = amount * 100 / totalColumns;
  
  return result ? `${result}%` : result;
};
// console.log(column(0, 12)); // 0
// console.log(column(3, 12)); // 25%
// console.log(column(6, 12)); // 50%
// console.log(column('6', 12)); // 50%
// console.log(column('rr6', 12)); // Error
