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
    Object.keys(object).some(key => predicate(object[key], key, object));

/**
 *
 * @param {Object} object
 * @param {function(value: *, key: string, object: Object): boolean} predicate
 * @return {boolean}
 */
export const objectEvery = (object, predicate) =>
    Object.keys(object).every(key => predicate(object[key], key, object));

/**
 *
 * @param {Object|Array} value
 * @param {string|number} index
 * @return {*}
 */
export const getNestedValue = (value, index) => {
    const wrongValueType = typeof index === 'number'
        ? !Array.isArray(value)
        : (typeof value !== 'object' || value === null);

    if (wrongValueType) throw new Error('Wrong type of value');
    return value[index];
};

/**
 *
 * @param {*} value
 * @param {(string|number)[]} path
 * @return {*}
 */
export const getValueByPath = (value, path) => path.reduce(getNestedValue, value);

/**
 *
 * @param {*} value
 * @param {(string|number)[]} path
 * @param {*} newValue
 * @return {*}
 */
export const setValueByPath = (value, path, newValue) => {
    if (path.length === 0) return newValue;

    for (i = 0; i < path.length - 1; i++)
        value = value[path[i]];

    value[path[i]] = newValue;
    return value;
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
