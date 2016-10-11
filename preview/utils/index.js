'use strict';

/**
 * Get owner React element by condition
 *
 * @param  {function} el
 * @param  {function} [condition]
 * @return {function}
 */
export const getReactOwner = (el, condition) => {
    if(condition(el)) return el;

    const owner = el._currentElement._owner;
    if (!owner) return null;
    if (!condition) return owner;

    return getReactOwner(owner, condition);
};

/**
 * Get child React element by condition
 *
 * @param  {function} el
 * @param  {function} condition
 * @return {function}
 */
export const getReactChild = (el, condition) => {
    let child = null;

    if(el._renderedComponent) {
        child = el._renderedComponent;
        if (!child) return null;
        if (!condition) return child;
        return condition(child) ? child : getReactChild(child, condition);
    } else if(el._renderedChildren) {
        for(let key in el._renderedChildren) {
            if(condition(el._renderedChildren[key])) return el._renderedChildren[key];

            child = getReactChild(el._renderedChildren[key], condition);
            if(child) return child;
        }

        return null;
    }
};
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
}