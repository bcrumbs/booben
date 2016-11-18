/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import HTMLMeta from '../meta/html';
import miscMeta from '../meta/misc';

import { componentsToImmutable } from '../models/ProjectComponent';

import { isObject, objectMap, objectForEach } from './misc';

import { BUILT_IN_PROP_TYPES } from '../../common/shared-constants';

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
 * @param {Object} componentMeta
 * @param {string} prop
 * @param {string} language
 * @returns {?string}
 */
export const getComponentPropName = (componentMeta, prop, language) => {
    const stringId = componentMeta.props[prop].textKey;
    return getString(componentMeta, stringId, language);
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
        if (componentMeta.placement.inside.include) {
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
    }

    return true;
};

const buildDefaultValue = (value, source) => {
    if (Array.isArray(value)) {
        return {
            source,
            sourceData: {
                value: value.map(v => buildDefaultValue(v, source))
            }
        };
    }
    else if (isObject(value)) {
        return {
            source,
            sourceData: {
                value: objectMap(value, v => buildDefaultValue(v, source))
            }
        }
    }
    else {
        return {
            source,
            sourceData: { value }
        };
    }
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
                ret[propName] =
                    buildDefaultValue(propMeta.sourceConfigs.static.default, 'static');
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
                ret[propName] =
                    buildDefaultValue(propMeta.sourceConfigs.const.value, 'const');
            }
            else if (typeof propMeta.sourceConfigs.const.jssyConstId !== 'undefined') {
                ret[propName] = {
                    source: 'const',
                    sourceData: {
                        jssyConstId: propMeta.sourceConfigs.const.jssyConstId
                    }
                }
            }
        }
    });

    return ret;
};

/**
 * @typedef {Object} ConstructComponentOptions
 * @property {boolean} [isWrapper=false]
 * @property {boolean} [isNew=true]
 */

/**
 *
 * @type {ConstructComponentOptions}
 * @const
 */
const constructComponentDefaultOptions = {
    isWrapper: false,
    isNew: true
};

/**
 *
 * @param {string} componentName
 * @param {number} layoutIdx
 * @param {string} language
 * @param {Object} meta
 * @param {ConstructComponentOptions} [options]
 * @return {Immutable.Map}
 */
export const constructComponent = (componentName, layoutIdx, language, meta, options) => {
    options = Object.assign({}, constructComponentDefaultOptions, options || {});

    const componentMeta = getComponentMeta(componentName, meta);

    // Ids of detached components must start with zero
    let nextId = 0;

    const component = {
        id: nextId++,
        isNew: options.isNew,
        isWrapper: options.isWrapper,
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
                isNew: options.isNew,
                isWrapper: options.isWrapper,
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

/**
 *
 * @return {boolean}
 */
const returnTrue = () => true;

/**
 *
 * @type {Object<string, function(typedef1: TypeDefinition, typedef2: TypeDefinition): boolean>}
 * @const
 */
const typeCheckers = {
    'string': returnTrue,
    'bool': returnTrue,
    'int': returnTrue,
    'float': returnTrue,

    'oneOf': (typedef1, typedef2) => {
        if (typedef1.options.length !== typedef2.options.length) return false;

        return typedef1.options.every(option1 =>
            !!typedef2.options.find(option2 => option2.value === option1.value));
    },

    'object': returnTrue,

    'shape': (typedef1, typedef2) => {
        const keys1 = Object.keys(typedef1.fields),
            keys2 = Object.keys(typedef2.fields);

        if (keys1.length !== keys2.length) return false;

        return keys1.every(key => {
            if (!typedef2.fields.hasOwnProperty(key)) return false;
            return isCompatibleType(typedef1.fields[key], typedef2.fields[key]);
        });
    },

    'array': returnTrue(),
    'arrayOf': (typedef1, typedef2) => isCompatibleType(typedef1.ofType, typedef2.ofType),
    'component': returnTrue(),
    'func': () => false // TODO: Write actual checker
};

/**
 *
 * @param {TypeDefinition} typedef1
 * @param {TypeDefinition} typedef2
 * @return {boolean}
 */
export const isCompatibleType = (typedef1, typedef2) => {
    if (typedef1.type !== typedef2.type) return false;
    return typeCheckers[typedef1.type](typedef1, typedef2);
};

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {TypeDefinition} typedef
 * @returns {TypeDefinition}
 */
export const resolveTypedef = (componentMeta, typedef) => {
    if (BUILT_IN_PROP_TYPES.has(typedef.type)) return typedef;
    return componentMeta.types[typedef.type] || null;
};

/**
 *
 * @type {Set<string>}
 * @const
 */
const scalarTypes = new Set([
    'string',
    'int',
    'float',
    'bool',
    'oneOf',
    'component',
    'func'
]);

/**
 *
 * @param {TypeDefinition} typedef
 * @return {boolean}
 */
export const isScalarType = typedef => scalarTypes.has(typedef.type);

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {string} propName
 * @returns {TypeDefinition}
 */
export const getPropTypedef = (componentMeta, propName) =>
    resolveTypedef(componentMeta, componentMeta.props[propName]);
