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
 */
export const returnNull = /* istanbul ignore next */ () => null;

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
