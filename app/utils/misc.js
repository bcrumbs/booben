/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 * Does nothing
 */
export const noop = /* istanbul ignore next */ () => {};

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
