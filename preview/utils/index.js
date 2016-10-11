'use strict';

/**
 * Get parent DOM by condition
 * @param  {Object} el
 * @param  {function} condition
 * @return {function}
 */
export const getDomOwner = (el, condition) => {
    if(condition(el)) return el;

    const owner = el.parentNode;
    if(!owner) return null;
    if(!condition) return owner;

    return getDomOwner(owner, condition);
};
