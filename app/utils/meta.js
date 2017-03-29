/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import _forOwn from 'lodash.forown';
import HTMLMeta from '../meta/html';
import miscMeta from '../meta/misc';
import { componentsToImmutable } from '../models/ProjectComponent';
import { NO_VALUE, SYSTEM_PROPS } from '../../app/constants/misc';
import { objectSome } from './misc';

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
export const isAtomicComponent = (componentName, meta) =>
  getComponentKind(componentName, meta) === 'atomic';

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
  meta,
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
            inclusion.component,
          );

          if (containerName !== inclusionComponentName) return false;
        } else if (inclusion.group) {
          if (containerMeta.group !== inclusion.group) return false;
        } else if (inclusion.tag) {
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
            exclusion.component,
          );

          return containerName === exclusionComponentName;
        } else if (exclusion.group) {
          return containerMeta.group === exclusion.group;
        } else if (exclusion.tag) {
          return containerMeta.tags.has(exclusion.tag);
        } else {
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
 * @param {JssyValueDefinition} propMeta
 * @param {string} source
 * @return {boolean}
 */
export const isValidSourceForProp = (propMeta, source) =>
  propMeta.source.indexOf(source) > -1;

/**
 *
 * @param {ComponentMeta} componentMeta
 * @return {boolean}
 */
export const componentHasActions = componentMeta =>
  objectSome(
    componentMeta.props,
    propMeta => isValidSourceForProp(propMeta, 'actions'),
  );

/**
 *
 * @param {JssyValueDefinition} propMeta
 * @return {boolean}
 */
export const propHasDataContext = propMeta =>
  isValidSourceForProp(propMeta, 'data') &&
  !!propMeta.sourceConfigs.data.pushDataContext;

/**
 *
 * @param {?ComponentMeta} componentMeta
 * @param {JssyValueDefinition} propMeta
 * @return {ProjectComponentProp|Symbol}
 */
const buildDefaultConstValue = (componentMeta, propMeta) => {
  if (typeof propMeta.sourceConfigs.const.value !== 'undefined') {
    return {
      source: 'const',
      sourceData: {
        value: propMeta.sourceConfigs.const.value,
      },
    };
  }

  if (typeof propMeta.sourceConfigs.const.jssyConstId !== 'undefined') {
    return {
      source: 'const',
      sourceData: {
        jssyConstId: propMeta.sourceConfigs.const.jssyConstId,
      },
    };
  }

  return NO_VALUE;
};

/**
 *
 * @param {*} value
 * @return {ProjectComponentProp}
 */
const makeSimpleStaticValue = value => ({
  source: 'static',
  sourceData: { value },
});

/**
 *
 * @param {?ComponentMeta} componentMeta
 * @param {JssyValueDefinition} propMeta
 * @param {string} language
 * @param {*|Symbol} [_inheritedDefaultValue=NO_VALUE]
 * @return {ProjectComponentProp}
 */
const buildDefaultStaticValue = (
  componentMeta,
  propMeta,
  language,
  _inheritedDefaultValue = NO_VALUE,
) => {
  /* eslint-disable no-use-before-define */
  if (propMeta.sourceConfigs.static.defaultTextKey) {
    const string = (componentMeta && language)
      ? getString(
        componentMeta,
        propMeta.sourceConfigs.static.defaultTextKey,
        language,
      )
      : '';
    
    return makeSimpleStaticValue(string);
  }

  const defaultValue = _inheritedDefaultValue !== NO_VALUE
    ? _inheritedDefaultValue
    : propMeta.sourceConfigs.static.default;

  if (propMeta.type === 'shape') {
    if (defaultValue === null) return makeSimpleStaticValue(null);

    const value = {};

    _forOwn(propMeta.fields, (fieldMeta, fieldName) => {
      const inherited = typeof defaultValue[fieldName] !== 'undefined'
        ? defaultValue[fieldName]
        : NO_VALUE;

      value[fieldName] = _buildDefaultValue(
        componentMeta,
        fieldMeta,
        language,
        inherited,
      );
    });

    return makeSimpleStaticValue(value);
  }

  if (propMeta.type === 'objectOf') {
    if (defaultValue === null) return makeSimpleStaticValue(null);

    const value = {};

    _forOwn(defaultValue, (fieldValue, fieldName) => {
      value[fieldName] = _buildDefaultValue(
        componentMeta,
        propMeta.ofType,
        language,
        fieldValue,
      );
    });

    return makeSimpleStaticValue(value);
  }

  if (propMeta.type === 'arrayOf') {
    let value = [];

    if (defaultValue) {
      value = defaultValue.map(fieldValue => _buildDefaultValue(
        componentMeta,
        propMeta.ofType,
        language,
        fieldValue,
      ));
    } else if (propMeta.sourceConfigs.static.defaultNum) {
      for (let i = 0; i < propMeta.sourceConfigs.static.defaultNum; i++) {
        value.push(_buildDefaultValue(
          componentMeta,
          propMeta.ofType,
          language,
        ));
      }
    }

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
  /* eslint-enable no-use-before-define */
};

/**
 *
 * @return {ProjectComponentProp}
 */
const buildDefaultDesignerValue = () => ({
  source: 'designer',
  sourceData: {
    rootId: -1,
    component: null,
  },
});

/**
 *
 * @return {ProjectComponentProp}
 */
const buildDefaultDataValue = () => ({
  source: 'data',
  sourceData: {
    dataContext: [],
    queryPath: null,
  },
});

const buildDefaultActionsValue = () => ({
  source: 'actions',
  sourceData: {
    actions: [],
  },
});

/**
 *
 * @type {Object<string, function(componentMeta: ComponentMeta, propMeta: ComponentPropMeta, language: string, _inheritedDefaultValue: *|NO_VALUE): ProjectComponentProp|Symbol>}
 * @const
 */
const defaultValueBuilders = {
  static: buildDefaultStaticValue,
  const: buildDefaultConstValue,
  designer: buildDefaultDesignerValue,
  data: buildDefaultDataValue,
  actions: buildDefaultActionsValue,
};

/**
 *
 * @type {string[]}
 * @const
 */
const sourcePriority = [
  'const',
  'static',
  'designer',
  'data',
  'actions',
];

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {ComponentPropMeta} propMeta
 * @param {string} language
 * @param {*|NO_VALUE} [inheritedDefaultValue=NO_VALUE]
 * @return {ProjectComponentProp|NO_VALUE}
 */
const _buildDefaultValue = (
  componentMeta,
  propMeta,
  language,
  inheritedDefaultValue = NO_VALUE,
) => {
  for (let i = 0, l = sourcePriority.length; i < l; i++) {
    if (isValidSourceForProp(propMeta, sourcePriority[i])) {
      const defaultValue = defaultValueBuilders[sourcePriority[i]](
        componentMeta,
        propMeta,
        language,
        inheritedDefaultValue,
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
 * @param {Object<string, ComponentPropMeta>} propsMeta
 * @param {?ComponentMeta} [componentMeta=null]
 * @param {string} [language='']
 * @return {Object<string, ProjectComponentProp>}
 */
const buildDefaultProps = (propsMeta, componentMeta = null, language = '') => {
  const ret = {};

  _forOwn(propsMeta, (propMeta, propName) => {
    const defaultValue = buildDefaultValue(componentMeta, propMeta, language);
    if (defaultValue !== NO_VALUE) ret[propName] = defaultValue;
  });

  return ret;
};

/**
 * Constructs new immutable ProjectComponent record
 *
 * @param {string} componentName
 * @param {number} layoutIdx
 * @param {string} language
 * @param {Object} meta
 * @param {boolean} [isNew=true]
 * @param {boolean} [isWrapper=false]
 * @return {Immutable.Map}
 */
export const constructComponent = (
  componentName,
  layoutIdx,
  language,
  meta,
  { isWrapper = false, isNew = true } = {},
) => {
  const componentMeta = getComponentMeta(componentName, meta);

  // Ids of detached components must start with zero
  let nextId = 0;

  const component = {
    id: nextId++,
    isNew,
    isWrapper,
    name: componentName,
    title: '',
    systemProps: buildDefaultProps(SYSTEM_PROPS),
    props: buildDefaultProps(componentMeta.props, componentMeta, language),
    children: [],
  };

  if (componentMeta.kind === 'composite') {
    component.regionsEnabled = [];

    const { namespace } = parseComponentName(componentName);
    const layout = componentMeta.layouts[layoutIdx];

    layout.regions.forEach((region, idx) => {
      const regionComponentName = `${namespace}.${region.component}`;
      const regionComponentMeta = getComponentMeta(regionComponentName, meta);
      const props = Object.assign(
        buildDefaultProps(
          regionComponentMeta.props,
          regionComponentMeta,
          language,
        ),
        
        region.props || {},
      );

      component.children.push({
        id: nextId++,
        isNew,
        isWrapper,
        name: regionComponentName,
        title: '',
        systemProps: buildDefaultProps(SYSTEM_PROPS),
        props,
        children: [],
      });

      if (region.defaultEnabled) component.regionsEnabled.push(idx);
    });
  }

  return componentsToImmutable(component, -1, false, -1);
};

/**
 *
 * @param {JssyValueDefinition} typedef
 * @return {boolean}
 */
export const isPropTypeDefinition = typedef =>
  !!typedef.source &&
  !!typedef.sourceConfigs;

/**
 *
 * @param {JssyValueDefinition} propMeta
 * @return {boolean}
 */
export const propHasDataContest = propMeta =>
  !!propMeta.sourceConfigs.data &&
  !!propMeta.sourceConfigs.data.pushDataContext;

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {string} dataContext
 * @return {?{ propName: string, propMeta: ComponentPropMeta }}
 */
export const findPropThatPushedDataContext = (componentMeta, dataContext) => {
  const propNames = Object.keys(componentMeta.props);
  
  for (let i = 0; i < propNames.length; i++) {
    const propMeta = componentMeta.props[propNames[i]];
    if (
      propMeta.sourceConfigs.data &&
      propMeta.sourceConfigs.data.pushDataContext === dataContext
    ) return { propName: propNames[i], propMeta };
  }
  
  return null;
};

/**
 *
 * @param {Object} metadata
 * @return {Object}
 */
export const transformMetadata = metadata => {
  _forOwn(metadata, libMeta => {
    _forOwn(libMeta.components, componentMeta => {
      componentMeta.tags = new Set(componentMeta.tags);
    });
  });
  
  return metadata;
};
