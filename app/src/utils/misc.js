/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { is } from 'immutable';

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
