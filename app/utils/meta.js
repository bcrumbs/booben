/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import HTMLMeta from '../../app/meta/html';
import miscMeta from '../../app/meta/misc';

/**
 *
 * @param {string} componentName
 * @param {Object} meta
 * @returns {?Object}
 */
export const getComponentMeta = (componentName, meta) => {
    let [namespace, name] = componentName.split('.');
    if (!name) {
        name = namespace;
        namespace = '';
    }

    let components;
    if (namespace === '') components = miscMeta.components;
    else if (namespace === 'HTML') components = HTMLMeta.components;
    else components = meta[namespace] ? meta[namespace].components : null;

    return components ? (components[name] || null) : null;
};

/**
 *
 * @param {string} componentName
 * @param {Object} meta
 * @return {string}
 */
export const getComponentKind = (componentName, meta) => {
    const componentMeta = getComponentMeta(componentName, meta);
    if (!componentMeta) throw new Error(`Unknown component: ${componentName}`);
    return componentMeta.kind;
};

/**
 *
 * @param {string} componentName
 * @param {Object} meta
 * @return {boolean}
 */
export const isContainerComponent = (componentName, meta) =>
    getComponentKind(componentName, meta) === 'container';
