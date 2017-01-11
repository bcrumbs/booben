/**
 * @author Dmitriy Bizyaev
 */

'use strict';

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
 * Returns true
 * @return {boolean}
 */
export const returnTrue = () => true;

/**
 * Returns false
 * @return {boolean}
 */
export const returnFalse = () => false;

/**
 * Returns its first argument
 *
 * @template T
 * @param {T} arg
 * @return {T}
 */
export const returnArg = /* istanbul ignore next */ arg => arg;

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
 * @param {string} key
 * @return {boolean}
 */
export const hasOwnProperty = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

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
