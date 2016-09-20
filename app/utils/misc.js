/**
 * @author Dmitriy Bizyaev
 */

'use strict';

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
