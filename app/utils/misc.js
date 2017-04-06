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
 * @return {null}
 */
export const returnNull = /* istanbul ignore next */ () => null;

/**
 * Returns its first argument
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
export const isNumber = value => typeof value === 'number' && isFinite(value);

/**
 *
 * @param {*} value
 * @return {boolean}
 */
export const isInteger = value => isNumber(value) && value % 1 === 0;

/**
 *
 * @param {*} maybeObject
 * @return {boolean}
 */
export const isObject = maybeObject =>
  typeof maybeObject === 'object' && maybeObject !== null;

/**
 *
 * @param {Object} object
 * @param {function(value: *, key: string, object: Object)} fn
 */
export const objectForEach = (object, fn) =>
  void Object.keys(object).forEach(key => void fn(object[key], key, object));

/**
 *
 * @param {Object} object
 * @param {function(value: *, key: string, object: Object)} fn
 * @return {Object}
 */
export const objectMap = (object, fn) => {
  const ret = {};
  objectForEach(object, (value, key, object) => {
    ret[key] = fn(value, key, object);
  });
  return ret;
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
 * @return {Object}
 */
export const objectFilter = (object, predicate) => {
  const ret = {};
  objectForEach(object, (value, key, object) => {
    if (predicate(value, key, object)) ret[key] = object[key];
  });
  return ret;
};
/**
 *
 * @param {*} value
 * @return {*}
 */
export const clone = value => {
  if (Array.isArray(value)) return value.map(clone);
  else if (isObject(value)) return objectMap(value, clone);
  else return value;
};

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
 * @param {number} x
 * @param {number} y
 * @param {number} cX
 * @param {number} cY
 * @param {number} r
 * @return {boolean}
 */
export const pointIsInCircle = (x, y, cX, cY, r) => {
  const xx = x - cX,
    yy = y - cY;

  return xx * xx + yy * yy <= r * r;
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
