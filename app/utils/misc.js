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
 * @param {Function} fn
 * @param {number} threshold
 * @returns {Function}
 */
export const throttle = (fn, threshold) => {
    let last,
        deferTimer;

    return (...args) => {
        const now = Date.now();

        if (last && now < last + threshold) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(() => {
                last = now;
                fn(...args);
            }, threshold);
        }
        else {
            last = now;
            fn(...args);
        }
    };
};

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
    Object.keys(object).some(key => fn(object[key], key, object));

/**
 *
 * @param {Object} object
 * @param {function(value: *, key: string, object: Object): boolean} predicate
 * @return {boolean}
 */
export const objectEvery = (object, predicate) =>
    Object.keys(object).every(key => fn(object[key], key, object));

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
