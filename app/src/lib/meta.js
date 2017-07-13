/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import _forOwn from 'lodash.forown';

import {
  TypeNames,
  resolveTypedef,
  makeDefaultNonNullValue,
  makeDefaultValue,
} from '@jssy/types';

import HTMLMeta from '../meta/html';
import miscMeta from '../meta/misc';
import { componentsToImmutable } from '../models/ProjectComponent';
import { INVALID_ID, NO_VALUE, SYSTEM_PROPS } from '../constants/misc';
import { isDef, returnEmptyObject, objectSome } from '../utils/misc';

/**
 * @typedef {Object<string, Object<string, ComponentMeta>>} ComponentsMeta
 */

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
 * @param {ComponentsMeta} meta
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
 * @param {ComponentsMeta} meta
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
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const isAtomicComponent = (componentName, meta) =>
  getComponentKind(componentName, meta) === 'atomic';

/**
 *
 * @param {string} componentName
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const isContainerComponent = (componentName, meta) =>
  getComponentKind(componentName, meta) === 'container';

/**
 *
 * @param {string} componentName
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const isCompositeComponent = (componentName, meta) =>
  getComponentKind(componentName, meta) === 'composite';

/**
 *
 * @param {Object<string, Object<string, string>>} strings
 * @param {string} stringId
 * @param {string} language
 * @return {?string}
 */
export const getString = (strings, stringId, language) => {
  if (!strings[stringId]) return null;
  return strings[stringId][language] || null;
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
  return getString(componentMeta.strings, stringId, language);
};

/**
 *
 * @param {JssyValueDefinition} valueDef
 * @param {string} source
 * @return {boolean}
 */
export const isValidSourceForValue = (valueDef, source) =>
  valueDef.source.indexOf(source) > -1;

const defaultSourceConfigBuilders = {
  static: (valueDef, userTypedefs) => ({
    default: makeDefaultValue(valueDef, userTypedefs),
  }),
  
  const: (valueDef, userTypedefs) => ({
    value: makeDefaultValue(valueDef, userTypedefs),
  }),
  
  data: returnEmptyObject,
  designer: () => ({
    props: {},
  }),
  
  state: returnEmptyObject,
  routeParams: returnEmptyObject,
  actions: () => ({
    args: [],
  }),
};

/**
 *
 * @param {JssyValueDefinition} valueDef
 * @param {string} source
 * @param {Object<string, JssyTypeDefinition>} [userTypedefs=null]
 * @return {Object}
 */
export const getSourceConfig = (valueDef, source, userTypedefs = null) => {
  if (valueDef.sourceConfigs[source]) {
    return valueDef.sourceConfigs[source];
  }
  
  return defaultSourceConfigBuilders[source](valueDef, userTypedefs);
};

/**
 *
 * @param {ComponentMeta} componentMeta
 * @return {boolean}
 */
export const componentHasActions = componentMeta =>
  objectSome(
    componentMeta.props,
    propMeta => isValidSourceForValue(propMeta, 'actions'),
  );

/**
 *
 * @param {JssyValueDefinition} propMeta
 * @return {boolean}
 */
export const propHasDataContext = propMeta =>
  isValidSourceForValue(propMeta, 'data') &&
  !!getSourceConfig(propMeta, 'data').pushDataContext;

/**
 *
 * @param {*} value
 * @return {PlainJssyValue}
 */
const makeSimpleStaticValue = value => ({
  source: 'static',
  sourceData: { value },
});

/**
 *
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, Object<string, string>>} strings
 * @param {string} language
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {*|Symbol} [_inheritedDefaultValue=NO_VALUE]
 * @return {PlainJssyValue}
 */
const buildDefaultStaticValue = (
  valueDef,
  strings,
  language,
  userTypedefs,
  _inheritedDefaultValue = NO_VALUE,
) => {
  const sourceConfig = getSourceConfig(valueDef, 'static', userTypedefs);
  
  /* eslint-disable no-use-before-define */
  if (sourceConfig.defaultTextKey) {
    const string = (strings && language)
      ? getString(
        strings,
        sourceConfig.defaultTextKey,
        language,
      )
      : '';
    
    return makeSimpleStaticValue(string);
  }

  const defaultValue = _inheritedDefaultValue !== NO_VALUE
    ? _inheritedDefaultValue
    : sourceConfig.default;

  if (valueDef.type === TypeNames.SHAPE) {
    if (defaultValue === null) return makeSimpleStaticValue(null);

    const value = {};

    _forOwn(valueDef.fields, (fieldMeta, fieldName) => {
      const inherited = isDef(defaultValue[fieldName])
        ? defaultValue[fieldName]
        : NO_VALUE;

      value[fieldName] = _buildDefaultValue(
        fieldMeta,
        strings,
        language,
        userTypedefs,
        inherited,
      );
    });

    return makeSimpleStaticValue(value);
  } else if (valueDef.type === TypeNames.OBJECT_OF) {
    if (defaultValue === null) return makeSimpleStaticValue(null);

    const value = {};

    _forOwn(defaultValue, (fieldValue, fieldName) => {
      value[fieldName] = _buildDefaultValue(
        valueDef.ofType,
        strings,
        language,
        userTypedefs,
        fieldValue,
      );
    });

    return makeSimpleStaticValue(value);
  } else if (valueDef.type === TypeNames.ARRAY_OF) {
    let value = [];

    if (defaultValue) {
      value = defaultValue.map(fieldValue => _buildDefaultValue(
        valueDef.ofType,
        strings,
        language,
        userTypedefs,
        fieldValue,
      ));
    } else if (sourceConfig.defaultNum) {
      for (let i = 0; i < sourceConfig.defaultNum; i++) {
        value.push(_buildDefaultValue(
          valueDef.ofType,
          strings,
          language,
          userTypedefs,
        ));
      }
    }

    return makeSimpleStaticValue(value);
  } else if (valueDef.type === TypeNames.OBJECT) {
    if (defaultValue === null) return makeSimpleStaticValue(null);
    // TODO: Handle default value somehow
    return makeSimpleStaticValue({});
  } else if (valueDef.type === TypeNames.ARRAY) {
    // TODO: Handle default value somehow
    return makeSimpleStaticValue([]);
  } else {
    return makeSimpleStaticValue(defaultValue);
  }
  /* eslint-enable no-use-before-define */
};

/**
 *
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, Object<string, string>>} _
 * @param {string} __
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @return {PlainJssyValue}
 */
const buildDefaultConstValue = (valueDef, _, __, userTypedefs) => ({
  source: 'const',
  sourceData: {
    value: getSourceConfig(valueDef, 'const', userTypedefs).value,
  },
});

/**
 *
 * @return {PlainJssyValue}
 */
const buildDefaultDesignerValue = () => ({
  source: 'designer',
  sourceData: {
    rootId: INVALID_ID,
    component: null,
  },
});

/**
 *
 * @return {PlainJssyValue}
 */
const buildDefaultDataValue = () => ({
  source: 'data',
  sourceData: {
    dataContext: [],
    queryPath: null,
    queryArgs: {},
  },
});


/**
 *
 * @return {PlainJssyValue}
 */
const buildDefaultActionsValue = () => ({
  source: 'actions',
  sourceData: {
    actions: [],
  },
});

/**
 *
 * @type {Object<string, function(valueDef: JssyValueDefinition, strings: ?Object<string, Object<string, string>>, language: string, _inheritedDefaultValue: *|NO_VALUE): PlainJssyValue|Symbol>}
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
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, Object<string, string>>} strings
 * @param {string} language
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {*|Symbol} [inheritedDefaultValue=Symbol]
 * @return {PlainJssyValue|Symbol}
 */
const _buildDefaultValue = (
  valueDef,
  strings,
  language,
  userTypedefs,
  inheritedDefaultValue = NO_VALUE,
) => {
  const resolvedValueDef = resolveTypedef(valueDef, userTypedefs);
  
  for (let i = 0, l = sourcePriority.length; i < l; i++) {
    if (isValidSourceForValue(resolvedValueDef, sourcePriority[i])) {
      const defaultValue = defaultValueBuilders[sourcePriority[i]](
        resolvedValueDef,
        strings,
        language,
        userTypedefs,
        inheritedDefaultValue,
      );

      if (defaultValue !== NO_VALUE) return defaultValue;
    }
  }

  return NO_VALUE;
};

/**
 *
 * @param {JssyTypeDefinition|JssyValueDefinition} typedefOrValueDef
 * @return {boolean}
 */
export const isJssyValueDefinition = typedefOrValueDef =>
  !!typedefOrValueDef.source;

/**
 *
 * @param {JssyValueDefinition|JssyTypeDefinition} typedefOrValueDef
 * @param {Object<string, JssyTypeDefinition>} userTypedefs
 * @return {JssyValueDefinition}
 */
const ensureValueDef = (typedefOrValueDef, userTypedefs) => {
  if (isJssyValueDefinition(typedefOrValueDef)) return typedefOrValueDef;
  
  const ret = {
    ...typedefOrValueDef,
    source: ['static'],
    sourceConfigs: {
      static: {
        default: makeDefaultNonNullValue(typedefOrValueDef, userTypedefs),
      },
    },
  };
  
  if (typedefOrValueDef.type === TypeNames.SHAPE) {
    _forOwn(ret.fields, (fieldTypedef, fieldName) => {
      ret.fields[fieldName] = {
        ...fieldTypedef,
        source: ['static'],
        sourceConfigs: {
          static: {
            default: makeDefaultNonNullValue(fieldTypedef, userTypedefs),
          },
        },
      };
    });
  } else if (
    typedefOrValueDef.type === TypeNames.ARRAY_OF ||
    typedefOrValueDef.type === TypeNames.OBJECT_OF
  ) {
    ret.ofType = {
      ...ret.ofType,
      source: ['static'],
      sourceConfigs: {
        static: {
          default: makeDefaultNonNullValue(ret.ofType, userTypedefs),
        },
      },
    };
  }
  
  return ret;
};

/**
 *
 * @param {JssyValueDefinition|JssyTypeDefinition} valueDef
 * @param {?Object<string, Object<string, string>>} [strings=null]
 * @param {string} [language='']
 * @param {?Object<string, JssyTypeDefinition>} [userTypedefs=null]
 * @return {PlainJssyValue|NO_VALUE}
 */
export const buildDefaultValue = (
  valueDef,
  strings = null,
  language = '',
  userTypedefs = null,
) => _buildDefaultValue(
  ensureValueDef(valueDef, userTypedefs),
  strings,
  language,
  userTypedefs,
);

/**
 *
 * @param {Object<string, ComponentPropMeta>} propsMeta
 * @param {?Object<string, Object<string, string>>} [strings=null]
 * @param {string} [language='']
 * @param {?Object<string, JssyTypeDefinition>} [userTypedefs=null]
 * @return {Object<string, PlainJssyValue>}
 */
const buildDefaultProps = (
  propsMeta,
  strings = null,
  language = '',
  userTypedefs = null,
) => {
  const ret = {};

  _forOwn(propsMeta, (propMeta, propName) => {
    const defaultValue = buildDefaultValue(
      propMeta,
      strings,
      language,
      userTypedefs,
    );
    
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
 * @return {Immutable.Map<number, Object>}
 */
export const constructComponent = (
  componentName,
  layoutIdx,
  language,
  meta,
  { isWrapper = false, isNew = true } = {},
) => {
  const componentMeta = getComponentMeta(componentName, meta);

  // Ids of detached components start with zero
  let nextId = 0;

  const component = {
    id: nextId++,
    isNew,
    isWrapper,
    name: componentName,
    title: '',
    systemProps: buildDefaultProps(SYSTEM_PROPS),
    props: buildDefaultProps(
      componentMeta.props,
      componentMeta.strings,
      language,
      componentMeta.types,
    ),
    
    children: [],
  };

  if (componentMeta.kind === 'composite') {
    component.regionsEnabled = [];

    const { namespace } = parseComponentName(componentName);
    const layout = componentMeta.layouts[layoutIdx];

    layout.regions.forEach((region, idx) => {
      const regionComponentName = formatComponentName(
        namespace,
        region.component,
      );
      
      const regionComponentMeta = getComponentMeta(regionComponentName, meta);
      const props = Object.assign(
        buildDefaultProps(
          regionComponentMeta.props,
          regionComponentMeta.strings,
          language,
          regionComponentMeta.types,
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

  return componentsToImmutable(component, INVALID_ID, false, INVALID_ID);
};

/**
 *
 * @param {JssyValueDefinition} valueDef
 * @return {boolean}
 */
export const valueHasDataContest = valueDef =>
  isValidSourceForValue(valueDef, 'data') &&
  !!getSourceConfig(valueDef, 'data').pushDataContext;

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
      isValidSourceForValue(propMeta, 'data') &&
      getSourceConfig(propMeta, 'data').pushDataContext === dataContext
    ) {
      return {
        propName: propNames[i],
        propMeta,
      };
    }
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
