'use strict';

const instance = new Map();

export const set = function(key, value) {
    instance.set(key, value);
};

export const get = function(key) {
    return instance.get(key);
};
