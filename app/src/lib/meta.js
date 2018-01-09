/**
 * @author Dmitriy Bizyaev
 */

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
import { DEFAULT_LANGUAGE, COMPONENTS_TITLE_FORMATTING } from '../config';

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
 * @return {?ComponentMeta}
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
 * @param {string} componentName
 * @return {boolean}
 */
export const isHTMLComponent = componentName => {
  const { namespace } = parseComponentName(componentName);
  return namespace === 'HTML';
};

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
  if (valueDef.sourceConfigs && valueDef.sourceConfigs[source]) {
    return valueDef.sourceConfigs[source];
  }

  return defaultSourceConfigBuilders[source](valueDef, userTypedefs);
};

/**
 *
 * @param {string} componentName
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const componentHasActions = (componentName, meta) => {
  const componentMeta = getComponentMeta(componentName, meta);

  return objectSome(
    componentMeta.props,
    propMeta => isValidSourceForValue(propMeta, 'actions'),
  );
};


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
 * @typedef {Object} BuildDefaultValueOptions
 * @property {boolean} [forceEnable=false]
 */

/**
 *
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, Object<string, string>>} strings
 * @param {string} language
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {BuildDefaultValueOptions} options
 * @param {*|Symbol} [_inheritedDefaultValue=NO_VALUE]
 * @return {PlainJssyValue|Symbol}
 */
const buildDefaultStaticValue = (
  valueDef,
  strings,
  language,
  userTypedefs,
  options,
  _inheritedDefaultValue = NO_VALUE,
) => {
  const sourceConfig = getSourceConfig(valueDef, 'static', userTypedefs);

  if (
    valueDef.required === false &&
    sourceConfig.defaultEnabled === false &&
    !options.forceEnable
  ) {
    return null;
  }

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

      const fieldValue = _buildDefaultValue(
        fieldMeta,
        strings,
        language,
        userTypedefs,
        options,
        inherited,
      );

      if (fieldValue !== null) {
        value[fieldName] = fieldValue;
      }
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
        options,
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
        options,
        fieldValue,
      ));
    } else if (sourceConfig.defaultNum) {
      for (let i = 0; i < sourceConfig.defaultNum; i++) {
        value.push(_buildDefaultValue(
          valueDef.ofType,
          strings,
          language,
          userTypedefs,
          options,
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
 * @param {BuildDefaultValueOptions} options
 * @param {*} [inheritedDefaultValue=NO_VALUE]
 * @return {?PlainJssyValue}
 */
const _buildDefaultValue = (
  valueDef,
  strings,
  language,
  userTypedefs,
  options,
  inheritedDefaultValue = NO_VALUE,
) => {
  const resolvedValueDef = resolveTypedef(valueDef, userTypedefs);

  for (let i = 0, l = sourcePriority.length; i < l; i++) {
    if (isValidSourceForValue(resolvedValueDef, sourcePriority[i])) {
      return defaultValueBuilders[sourcePriority[i]](
        resolvedValueDef,
        strings,
        language,
        userTypedefs,
        options,
        inheritedDefaultValue,
      );
    }
  }

  return null;
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
 * @type {BuildDefaultValueOptions}
 */
const defaultBuildDefaultValueOptions = {
  forceEnable: false,
};

/**
 *
 * @param {JssyValueDefinition|JssyTypeDefinition} valueDef
 * @param {?Object<string, Object<string, string>>} [strings=null]
 * @param {string} [language='']
 * @param {?Object<string, JssyTypeDefinition>} [userTypedefs=null]
 * @param {?BuildDefaultValueOptions} [options=null]
 * @return {?PlainJssyValue}
 */
export const buildDefaultValue = (
  valueDef,
  strings = null,
  language = '',
  userTypedefs = null,
  options = null,
) => _buildDefaultValue(
  ensureValueDef(valueDef, userTypedefs),
  strings,
  language,
  userTypedefs,
  { ...defaultBuildDefaultValueOptions, ...(options || {}) },
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

    if (defaultValue !== null) ret[propName] = defaultValue;
  });

  return ret;
};

/**
 *
 * @param {string} componentName
 * @param {ComponentMeta} componentMeta
 * @param {string} language
 * @return {*}
 */
const formatNewComponentTitle = (componentName, componentMeta, language) => {
  switch (COMPONENTS_TITLE_FORMATTING) {
    case 0: {
      return '';
    }
    case 1: {
      return componentName;
    }
    case 2: {
      return getString(componentMeta.strings, componentMeta.textKey, language);
    }
    default: {
      return '';
    }
  }
};

/**
 * Constructs new immutable ProjectComponent record
 *
 * @param {string} componentName
 * @param {number} [layoutIdx=0]
 * @param {string} [language]
 * @param {?ComponentsMeta} [meta=null]
 * @param {boolean} [isNew=true]
 * @param {boolean} [isWrapper=false]
 * @return {Immutable.Map<number, Object>}
 */
export const constructComponent = (
  componentName,
  layoutIdx = 0,
  language = DEFAULT_LANGUAGE,
  meta = null,
  { isWrapper = false, isNew = true } = {},
) => {
  const componentMeta = getComponentMeta(componentName, meta);

  if (componentMeta === null) {
    throw new Error(
      `constructComponent(): failed to get metadata for '${componentName}'`,
    );
  }

  // Ids of detached components start with zero
  let nextId = 0;

  const component = {
    id: nextId++,
    isNew,
    isWrapper,
    name: componentName,
    title: formatNewComponentTitle(componentName, componentMeta, language),
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
        title: formatNewComponentTitle(
          regionComponentName,
          regionComponentMeta,
          language,
        ),
        systemProps: buildDefaultProps(SYSTEM_PROPS),
        props,
        children: [],
      });

      if (region.defaultEnabled) component.regionsEnabled.push(idx);
    });
  }

  return componentsToImmutable(component);
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
 * @param {Object} meta
 * @return {Object}
 */
export const transformMetadata = meta => {
  _forOwn(meta, libMeta => {
    _forOwn(libMeta.components, componentMeta => {
      componentMeta.tags = new Set(componentMeta.tags);
    });
  });

  return meta;
};

/**
 *
 * @param {Object} meta
 * @return {string}
 */
export const getContainerStyle = meta => {
  const combinedStyle = Object.keys(meta).reduce(
    (acc, cur) => Object.assign(acc, meta[cur].containerStyle || {}),
    {},
  );

  return Object.keys(combinedStyle)
    .map(prop => `${prop}:${combinedStyle[prop]}`)
    .join(';');
};
