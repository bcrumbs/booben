/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import HTMLMeta from '../../app/meta/html';
import miscMeta from '../../app/meta/misc';

import { componentsToImmutable } from '../models/ProjectComponent';

import { objectForEach } from './misc';

/**
 *
 * @param {string} namespace
 * @param {Object} meta
 * @returns {?Object}
 */
export const getNamespaceMeta = (namespace, meta) => {
    if (namespace === '') return miscMeta;
    if (namespace === 'HTML') return HTMLMeta;
    return meta[namespace] || null;
};

/**
 *
 * @param {string} namespace
 * @param {Object} meta
 * @returns {?Object[]}
 */
export const getComponentsMeta = (namespace, meta) => {
    const namespaceMeta = getNamespaceMeta(namespace, meta);
    return namespaceMeta ? namespaceMeta.components : null;
};

/**
 *
 * @param {string} componentName
 * @return {{namespace: string, name: string}}
 */
export const parseComponentName = componentName => {
    let [namespace, name] = componentName.split('.');
    if (!name) {
        name = namespace;
        namespace = '';
    }

    return { namespace, name };
};

/**
 *
 * @param {string} namespace
 * @param {string} name
 * @return {string}
 */
export const formatComponentName = (namespace, name) =>
    namespace ? `${namespace}.${name}` : name;

/**
 *
 * @param {string} componentName
 * @param {Object} meta
 * @return {?Object}
 */
export const getComponentMeta = (componentName, meta) => {
    const { namespace, name } = parseComponentName(componentName);

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

/**
 *
 * @param {string} componentName
 * @param {Object} meta
 * @return {boolean}
 */
export const isCompositeComponent = (componentName, meta) =>
    getComponentKind(componentName, meta) === 'composite';

/**
 *
 * @param {Object} componentMeta
 * @param {string} stringId
 * @param {string} language
 * @return {?string}
 */
export const getString = (componentMeta, stringId, language) => {
    if (!componentMeta.strings[stringId]) return null;
    return componentMeta.strings[stringId][language] || null;
};

/**
 *
 * @param {string} componentName
 * @param {string} containerName
 * @param {string[]|Immutable.List<string>} containerChildrenNames
 * @param {number} position - -1 = ignore position constraints
 * @param {Object} meta
 * @return {boolean}
 */
export const canInsertComponent = (componentName, containerName, containerChildrenNames, position, meta) => {
    const componentMeta = getComponentMeta(componentName, meta),
        { namespace } = parseComponentName(componentName),
        containerMeta = getComponentMeta(containerName, meta);

    if (containerMeta.kind !== 'container') return false;
    if (!componentMeta.placement) return true;

    if (componentMeta.placement.inside) {
        if (componentMeta.placement.inside.exclude) {
            const deny = componentMeta.placement.inside.exclude.some(exclusion => {
                if (exclusion.component) {
                    const exclusionComponentName = formatComponentName(
                        namespace,
                        exclusion.component
                    );

                    return containerName === exclusionComponentName;
                }
                else if (exclusion.group) {
                    return containerMeta.group === exclusion.group;
                }
                else if (exclusion.tag) {
                    return containerMeta.tags.has(exclusion.tag);
                }
                else {
                    return false;
                }
            });

            if (deny) return false;
        }
        else if (componentMeta.placement.inside.include) {
            const sameComponentsNum = containerChildrenNames
                .reduce((acc, cur) => acc + (cur === componentName ? 1 : 0), 0);

            const allow = componentMeta.placement.inside.include.some(inclusion => {
                if (inclusion.component) {
                    const inclusionComponentName = formatComponentName(
                        namespace,
                        inclusion.component
                    );

                    if (containerName !== inclusionComponentName) return false;
                }
                else if (inclusion.group) {
                    if (containerMeta.group !== inclusion.group) return false;
                }
                else if (inclusion.tag) {
                    if (!containerMeta.tags.has(inclusion.tag)) return false;
                }

                return !inclusion.maxNum || sameComponentsNum < inclusion.maxNum;
            });

            if (!allow) return false;
        }
    }

    return true;
};

/**
 *
 * @param {Object} componentMeta
 * @param {string} language
 * @return {Object}
 */
const buildDefaultProps = (componentMeta, language) => {
    const ret = {};

    objectForEach(componentMeta.props, (propMeta, propName) => {
        if (propMeta.source.indexOf('static') > -1 && propMeta.sourceConfigs.static) {
            if (typeof propMeta.sourceConfigs.static.default !== 'undefined') {
                ret[propName] = {
                    source: 'static',
                    sourceData: {
                        value: propMeta.sourceConfigs.static.default
                    }
                };
            }
            else if (propMeta.sourceConfigs.static.defaultTextKey) {
                const key = propMeta.sourceConfigs.static.defaultTextKey,
                    translations = componentMeta.strings[key];

                ret[propName] = {
                    source: 'static',
                    sourceData: {
                        value: translations[language] || ''
                    }
                };
            }
        }
        else if (propMeta.source.indexOf('const') > -1 && propMeta.sourceConfigs.const) {
            if (typeof propMeta.sourceConfigs.const.value !== 'undefined') {
                ret[propName] = {
                    source: 'const',
                    sourceData: {
                        value: propMeta.sourceConfigs.const.value
                    }
                }
            }
        }
    });

    return ret;
};

/**
 *
 * @param {string} componentName
 * @param {number} layoutIdx
 * @param {string} language
 * @param {Object} meta
 * @return {Immutable.Map}
 */
export const constructComponent = (componentName, layoutIdx, language, meta) => {
    const componentMeta = getComponentMeta(componentName, meta);

    // Ids of detached components must start with zero
    let nextId = 0;

    const component = {
        id: nextId++,
        isNew: true,
        name: componentName,
        title: '',
        props: buildDefaultProps(componentMeta, language),
        children: []
    };

    if (componentMeta.kind === 'composite') {
        component.regionsEnabled = [];

        const { namespace } = parseComponentName(componentName),
            layout = componentMeta.layouts[layoutIdx];

        layout.regions.forEach((region, idx) => {
            const regionComponentName = `${namespace}.${region.component}`,
                regionComponentMeta = getComponentMeta(regionComponentName, meta);

            const props = Object.assign(
                buildDefaultProps(regionComponentMeta, language),
                region.props || {}
            );

            component.children.push({
                id: nextId++,
                isNew: true,
                name: regionComponentName,
                title: '',
                props,
                children: []
            });

            if (region.defaultEnabled) component.regionsEnabled.push(idx);
        });
    }

    return componentsToImmutable(component, -1, false, -1);
};
