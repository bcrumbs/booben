'use strict';

import { css } from 'styled-components';

import {
  isPositiveInteger,
  isNaturalNumber,
  isDef,
  isTruthy,
} from '../../utils/misc';

/**
 *
 * @param {string} name
 * @param {number} value
 * @param {number} baseDivider
 * @return {string|undefined}
 */
const generateMediaQueryArg = (name, value, baseDivider) => {
  if (!isPositiveInteger(baseDivider)) {
    throw new Error(`Invalid 'baseDivider' value: ${baseDivider}`);
  }
  
  if (isDef(value)) {
    if (typeof value === 'string') {
      return `(${name}: ${value})`;
    } else if (isNaturalNumber(value)) {
      return `(${name}: ${value / baseDivider}em)`;
    } else {
      throw new Error(`Invalid media query '${name}' value: ${value}`);
    }
  } else {
    return void 0;
  }
};

const mqArgNames = ['min-width', 'max-width'];

/**
 * MEDIA QUERIES
 * iterate through the sizes and create a media template
 *
 * @param {number} fromWidth
 * @param {number} untilWidth
 * @param {number} [baseDivider=16]
 * @return {Function}
 */
export const media = (fromWidth, untilWidth, baseDivider = 16) => (...args) => {
  const query = [fromWidth, untilWidth]
    .map((value, index) => generateMediaQueryArg(
      mqArgNames[index],
      value,
      baseDivider,
    ))
    .filter(isTruthy)
    .join(' and ');

  return query.length
    ? css`
        @media ${query} {
          ${css(...args)}
        }
      `
    : null;
};
