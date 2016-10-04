'use strict';

let instance = new Map();

export const set = (key, value) => {
    instance.set(key, value);
};

export const get = key => instance.get(key);

export const clear = () => {
    instance = new Map();
}