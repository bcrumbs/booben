/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import HTMLMeta from '../meta/html';
import miscMeta from '../meta/misc';

import { componentsToImmutable } from '../models/ProjectComponent';

import { objectForEach } from './misc';

import { NO_VALUE } from  '../../app/constants/misc';

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
export const canInsertComponent = (
    componentName,
    containerName,
    containerChildrenNames,
    position,
    meta
) => {
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

/**
 *
 * @param {PropTypeDefinition} propMeta
 * @param {string} source
 * @return {boolean}
 */
export const isValidSourceForProp = (propMeta, source) =>
    propMeta.source.indexOf(source) > -1;

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {PropTypeDefinition} propMeta
 * @param {string} language
 * @return {ProjectComponentProp}
 */
const buildDefaultConstValue = (componentMeta, propMeta, language) => {
    if (typeof propMeta.sourceConfigs.const.value !== 'undefined') {
        return {
            source: 'const',
            sourceData: {
                value: propMeta.sourceConfigs.const.value
            }
        };
    }

    if (typeof propMeta.sourceConfigs.const.jssyConstId !== 'undefined') {
        return {
            source: 'const',
            sourceData: {
                jssyConstId: propMeta.sourceConfigs.const.jssyConstId
            }
        }
    }

    return NO_VALUE;
};

/**
 *
 * @param {*} value
 * @return {ProjectComponentProp}
 */
const makeSimpleStaticValue = value => ({ source: 'static', sourceData: { value } });

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {PropTypeDefinition} propMeta
 * @param {string} language
 * @param {*|NO_VALUE} [_inheritedDefaultValue=NO_VALUE]
 * @return {ProjectComponentProp}
 */
const buildDefaultStaticValue = (
    componentMeta,
    propMeta,
    language,
    _inheritedDefaultValue = NO_VALUE
) => {
    if (propMeta.sourceConfigs.static.defaultTextKey) {
        return makeSimpleStaticValue(getString(
            componentMeta,
            propMeta.sourceConfigs.static.defaultTextKey,
            language
        ));
    }

    const defaultValue = _inheritedDefaultValue !== NO_VALUE
        ? _inheritedDefaultValue
        : propMeta.sourceConfigs.static.default;

    if (propMeta.type === 'shape') {
        if (defaultValue === null) return makeSimpleStaticValue(null);

        const value = {};

        objectForEach(propMeta.fields, (fieldMeta, fieldName) => {
            const inherited = typeof defaultValue[fieldName] !== 'undefined'
                ? defaultValue[fieldName]
                : NO_VALUE;

            value[fieldName] = _buildDefaultValue(
                componentMeta,
                fieldMeta,
                language,
                inherited
            );
        });

        return makeSimpleStaticValue(value);
    }

    if (propMeta.type === 'objectOf') {
        if (defaultValue === null) return makeSimpleStaticValue(null);

        const value = {};

        objectForEach(defaultValue, (fieldValue, fieldName) => {
            value[fieldName] = _buildDefaultValue(
                componentMeta,
                propMeta.ofType,
                language,
                fieldValue
            );
        });

        return makeSimpleStaticValue(value);
    }

    if (propMeta.type === 'arrayOf') {
        const value = defaultValue.map(fieldValue => _buildDefaultValue(
            componentMeta,
            propMeta.ofType,
            language,
            fieldValue
        ));

        return makeSimpleStaticValue(value);
    }

    if (propMeta.type === 'object') {
        if (defaultValue === null) return makeSimpleStaticValue(null);
        // TODO: Handle default value somehow
        return makeSimpleStaticValue({});
    }

    if (propMeta.type === 'array') {
        // TODO: Handle default value somehow
        return makeSimpleStaticValue([]);
    }

    return makeSimpleStaticValue(defaultValue);
};

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {PropTypeDefinition} propMeta
 * @param {string} language
 * @return {ProjectComponentProp}
 */
const buildDefaultDesignerValue = (componentMeta, propMeta, language) => ({
    source: 'designer',
    sourceData: {
        rootId: -1
    }
});

/**
 *
 * @type {Object<string, function(componentMeta: ComponentMeta, propMeta: ComponentPropMeta, language: string, _inheritedDefaultValue: *|NO_VALUE): ProjectComponentProp|NO_VALUE>}
 * @const
 */
const defaultValueBuilders = {
    'static': buildDefaultStaticValue,
    'const': buildDefaultConstValue,
    'designer': buildDefaultDesignerValue
};

/**
 *
 * @type {string[]}
 * @const
 */
const sourcePriority = [
    'const',
    'static',
    'designer'
];

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {ComponentPropMeta} propMeta
 * @param {string} language
 * @param {*|NO_VALUE} [_inheritedDefaultValue=NO_VALUE]
 * @return {ProjectComponentProp|NO_VALUE}
 */
const _buildDefaultValue = (
    componentMeta,
    propMeta,
    language,
    _inheritedDefaultValue = NO_VALUE
) => {
    for (let i = 0, l = sourcePriority.length; i < l; i++) {
        if (isValidSourceForProp(propMeta, sourcePriority[i])) {
            const defaultValue = defaultValueBuilders[sourcePriority[i]](
                componentMeta,
                propMeta,
                language,
                _inheritedDefaultValue
            );

            if (defaultValue !== NO_VALUE) return defaultValue;
        }
    }

    return NO_VALUE;
};

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {ComponentPropMeta} propMeta
 * @param {string} language
 * @return {ProjectComponentProp|NO_VALUE}
 */
export const buildDefaultValue = (componentMeta, propMeta, language) =>
    _buildDefaultValue(componentMeta, propMeta, language);

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {string} language
 * @return {Object<string, ProjectComponentProp>}
 */
const buildDefaultProps = (componentMeta, language) => {
    const ret = {};

    objectForEach(componentMeta.props, (propMeta, propName) => {
        const defaultValue = buildDefaultValue(componentMeta, propMeta, language);
        if (defaultValue !== NO_VALUE) ret[propName] = defaultValue;
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

    'object': (typedef1, typedef2) => !!typedef1.notNull === !!typedef2.notNull,

    'objectOf': (typedef1, typedef2) =>
        !!typedef1.notNull === !!typedef2.notNull &&
        isCompatibleType(typedef1.ofType, typedef2.ofType),

    'shape': (typedef1, typedef2) => {
        if (!!typedef1.notNull !== !!typedef2.notNull) return false;

        const keys1 = Object.keys(typedef1.fields),
            keys2 = Object.keys(typedef2.fields);

        if (keys1.length !== keys2.length) return false;

        return keys1.every(key => {
            if (!typedef2.fields.hasOwnProperty(key)) return false;
            return isCompatibleType(typedef1.fields[key], typedef2.fields[key]);
        });
    },

    'array': returnTrue(),

    'arrayOf': (typedef1, typedef2) =>
        isCompatibleType(typedef1.ofType, typedef2.ofType),

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

/**
 *
 * @param {TypeDefinition} typedef
 * @param {(string|number)[]} valuePath
 * @return {TypeDefinition}
 */
export const getNestedTypedef = (typedef, valuePath) => valuePath.reduce((acc, cur) => {
    if (typeof cur === 'string') {
        if (acc.type === 'objectOf') return acc.ofType;
        else if (acc.type === 'shape') return acc.fields[cur];
        else throw new Error(`getNestedTypedef(): incompatible type: ${acc.type}`);
    }
    else if (typeof cur === 'number') {
        if (acc.type === 'arrayOf') return acc.ofType;
        else throw new Error(`getNestedTypedef(): incompatible type: ${acc.type}`);
    }
    else {
        throw new Error(
            `getNestedTypedef(): valuePath can contain ` +
            `only numbers and strings, got ${cur}`
        );
    }
}, typedef);
