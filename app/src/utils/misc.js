/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { List, is } from 'immutable';

/**
 * Does nothing
 */
export const noop = /* istanbul ignore next */ () => {};

/**
 * Returns null :)
 *
 * @return {null}
 */
export const returnNull = /* istanbul ignore next */ () => null;

/**
 * Returns its first argument
 *
 * @template T
 * @param {T} arg
 * @return {T}
 */
export const returnArg = /* istanbul ignore next */ arg => arg;

/**
 * Returns true
 * @return {boolean}
 */
export const returnTrue = /* istanbul ignore next */ () => true;

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isString = value => typeof value === 'string';

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isNumber = value => typeof value === 'number' && isFinite(value);

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isInteger = value => isNumber(value) && value % 1 === 0;

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isNaturalNumber = value => isInteger(value) && value >= 0;

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isPositiveInteger = value => isInteger(value) && value > 0;

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isDef = value => typeof value !== 'undefined';

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isUndef = value => typeof value === 'undefined';

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isNullOrUndef = value => value === null || isUndef(value);

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isTruthy = value => !!value;

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isFalsy = value => !value;

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isFunction = value => typeof value === 'function';

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isObject = value => typeof value === 'object' && value !== null;

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isObjectOrNull = value => typeof value === 'object';

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isArrayOrList = value =>
  Array.isArray(value) || List.isList(value);

/**
 *
 * @param {number} msecs
 * @return {Promise}
 */
export const wait = msecs =>
  new Promise(resolve => void setTimeout(resolve, msecs));

/**
 *
 * @param {function(): boolean} condition
 * @param {number} [pause=0]
 * @return {Promise}
 */
export const waitFor = async (condition, pause = 0) => {
  while (!condition()) await wait(pause);
};

/**
 *
 * @param {Object} object
 * @param {function(value: *, key: string, object: Object): boolean} predicate
 * @return {boolean}
 */
export const objectSome = (object, predicate) =>
  Object.keys(object).some(key => predicate(object[key], key, object));

/**
 *
 * @param {Object} object
 * @param {function(value: *, key: string, object: Object): boolean} predicate
 * @return {boolean}
 */
export const objectEvery = (object, predicate) =>
  Object.keys(object).every(key => predicate(object[key], key, object));

//noinspection JSCheckFunctionSignatures
/**
 *
 * @template T
 * @template N
 * @param {T[]} array
 * @param {function(item: T, idx: number, array: T[]): string} keyFn
 * @param {function(item: T, idx: number, array: T[]): N} [valueFn]
 * @param {function(item: T, idx: number, array: T[]): boolean} [includeFn]
 * @return {Object<string, N>}
 */
export const arrayToObject = (
  array,
  keyFn,
  valueFn = returnArg,
  includeFn = returnTrue,
) => array.reduce(
  (acc, cur, idx) => includeFn(cur, idx, array)
    ? Object.assign(acc, { [keyFn(cur, idx, array)]: valueFn(cur, idx, array) })
    : acc,
  
  {},
);

/**
 *
 * @template T
 * @template N
 * @param {Object<string, T>} object
 * @param {function(item: T, key: string, object: Object<string, T>): N} [itemFn]
 * @param {function(item: T, key: string, object: Object<string, T>): boolean} [includeFn]
 * @return {N[]}
 */
export const objectToArray = (
  object,
  itemFn = returnArg,
  includeFn = returnTrue,
) => {
  const keys = Object.keys(object);
  const ret = [];
  
  keys.forEach(key => {
    //noinspection JSCheckFunctionSignatures
    if (!includeFn(object[key], key, object)) return;
    //noinspection JSCheckFunctionSignatures
    ret.push(itemFn(object[key], key, object));
  });
  
  return ret;
};

/**
 *
 * @param {string} key
 * @return {function(object: Object): *}
 */
export const getter = key => object => object[key];

/**
 *
 * @param {(function(arg: *): boolean)[]} filterFns
 * @return {function(arg: *): boolean}
 */
export const combineFiltersAll = filterFns =>
  arg => filterFns.every(fn => fn(arg));

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} cX
 * @param {number} cY
 * @param {number} r
 * @return {boolean}
 */
export const pointIsInCircle = (x, y, cX, cY, r) =>
  (x - cX) ** 2 + (y - cY) ** 2 <= r ** 2;

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} cX
 * @param {number} cY
 * @param {number} r
 * @return {number}
 */
export const pointPositionRelativeToCircle = (x, y, cX, cY, r) =>
  ((x - cX) ** 2 + (y - cY) ** 2) / (r ** 2);

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} rx
 * @param {number} ry
 * @param {number} rw
 * @param {number} rh
 * @return {boolean}
 */
export const pointIsInRect = (x, y, rx, ry, rw, rh) =>
  x >= rx &&
  x <= rx + rw &&
  y >= ry &&
  y <= ry + rh;

/**
 *
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @return {number}
 */
export const distance = (x1, y1, x2, y2) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

/**
 *
 * @type {Object<string, number>}
 */
export const PointPositions = {
  INSIDE: 0x00,
  NORTH: 0x01,
  NORTH_EAST: 0x11,
  EAST: 0x10,
  SOUTH_EAST: 0x12,
  SOUTH: 0x02,
  SOUTH_WEST: 0x22,
  WEST: 0x20,
  NORTH_WEST: 0x21,
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} rx
 * @param {number} ry
 * @param {number} rw
 * @param {number} rh
 * @return {number}
 */
export const pointPositionRelativeToRect = (x, y, rx, ry, rw, rh) => {
  let horizontal = PointPositions.INSIDE;
  let vertical = PointPositions.INSIDE;

  if (x < rx) horizontal = PointPositions.WEST;
  else if (x > rx + rw) horizontal = PointPositions.EAST;

  if (y < ry) vertical = PointPositions.NORTH;
  else if (y > ry + rh) vertical = PointPositions.SOUTH;

  return horizontal | vertical;
};

/**
 *
 * @param {Immutable.List} maybePrefix
 * @param {Immutable.List} list
 * @return {boolean}
 */
export const isPrefixList = (maybePrefix, list) => {
  if (maybePrefix.size > list.size) return false;
  return maybePrefix.every((item, idx) => is(item, list.get(idx)));
};

/**
 *
 * @param {string} prefix
 * @param {string} path
 * @return {string}
 */
export const concatPath = (prefix, path) => {
  if (prefix === '') return path;
  if (prefix === '/') return `/${path}`;
  return `${prefix}/${path}`;
};
