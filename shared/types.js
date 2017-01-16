/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const _mapValues = require('lodash.mapvalues');

/**
 * @typedef {Object} OneOfOption
 * @property {string} [textKey]
 * @property {*} value
 */

/**
 * @typedef {Object} TypeDefinition
 * @property {string} type - Type name. Can be one of the built-in types ({@link BUILT_IN_PROP_TYPES}) or one of user-defined types.
 * @property {boolean} [notNull] - For "shape", "objectOf" and "object" types only.
 * @property {TypeDefinition} [ofType] - For "arrayOf" and "objectOf" types only - type of items.
 * @property {Object<string, TypeDefinition>} [fields] - For "shape" type only.
 * @property {OneOfOption[]} [options] - For "oneOf" type only.
 */

/**
 *
 * @type {Set<string>}
 */
const BUILT_IN_PROP_TYPES = exports.BUILT_IN_PROP_TYPES = new Set([
  'string',
  'bool',
  'int',
  'float',
  'oneOf',
  'shape',
  'object',
  'objectOf',
  'array',
  'arrayOf',
  'func',
  'component',
]);

/**
 *
 * @param {*} value
 * @return {boolean}
 */
const isNumber = value => typeof value === 'number' && isFinite(value);

/**
 *
 * @return {boolean}
 */
const returnTrue = /* istanbul ignore next */ () => true;

/**
 *
 * @return {boolean}
 */
const returnFalse = /* istanbul ignore next */ () => false;

/**
 *
 * @return {null}
 */
const returnNull = /* istanbul ignore next */ () => null;

/**
 *
 * @param {Object} object
 * @param {string} key
 * @return {boolean}
 */
const hasOwnProperty = /* istanbul ignore next */ (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

/* eslint-disable quote-props, no-use-before-define */
const TYPES = {
  'string': {
    validate: value => typeof value === 'string',
    print: () => 'string',
    isEqualType: returnTrue,
    makeDefaultValue: () => '',
  },
  
  'bool': {
    validate: value => typeof value === 'boolean',
    print: () => 'bool',
    isEqualType: returnTrue,
    makeDefaultValue: () => false,
  },
  
  'int': {
    validate: value => isNumber(value) && value % 1 === 0,
    print: () => 'int',
    isEqualType: returnTrue,
    makeDefaultValue: () => 0,
  },
  
  'float': {
    validate: value => isNumber(value),
    print: () => 'float',
    isEqualType: returnTrue,
    makeDefaultValue: () => 0.0,
  },
  
  'oneOf': {
    validate: (value, typedef) =>
      typedef.options.some(option => option.value === value),
    
    print: typedef => {
      const options = typedef.options
        .map(({ value }) => JSON.stringify(value))
        .join(', ');
  
      return `oneOf(${options})`;
    },
    
    isEqualType: (typedef1, typedef2) => {
      if (typedef1.options.length !== typedef2.options.length) return false;

      return typedef1.options.every(option1 =>
        !!typedef2.options.find(option2 => option2.value === option1.value));
    },

    makeDefaultValue: typedef => typedef.options[0].value,
  },
  
  'array': {
    validate: value => Array.isArray(value),
    print: () => 'array',
    isEqualType: returnTrue,
    makeDefaultValue: () => [],
  },
  
  'arrayOf': {
    validate: (value, typedef, userTypedefs) =>
      Array.isArray(value) && value.every(item =>
        isValidValue(item, typedef.ofType, userTypedefs)),
    
    print: (typedef, userTypedefs) =>
      `arrayOf(${printType(typedef.ofType, userTypedefs)})`,
    
    isEqualType: (typedef1, typedef2, userTypedefs1, userTypedefs2) =>
      isEqualType(
        typedef1.ofType,
        typedef2.ofType,
        userTypedefs1,
        userTypedefs2
      ),

    makeDefaultValue: () => [],
  },
  
  'object': {
    validate: (value, typedef) =>
      typeof value === 'object' && (!typedef.notNull || value !== null),
    
    print: () => 'object',
    
    isEqualType: (typedef1, typedef2) =>
      !!typedef1.notNull === !!typedef2.notNull,

    makeDefaultValue: typedef => typedef.notNull ? {} : null,
  },
  
  'objectOf': {
    validate: (value, typedef, userTypedefs) =>
      typeof value === 'object' && (
        value === null
          ? !typedef.notNull
          : Object.keys(value).every(key =>
            isValidValue(value[key], typedef.ofType, userTypedefs))
      ),
    
    print: (typedef, userTypedefs) =>
      `objectOf(${printType(typedef.ofType, userTypedefs)})`,
    
    isEqualType: (typedef1, typedef2, userTypedefs1, userTypedefs2) =>
      !!typedef1.notNull === !!typedef2.notNull &&
      isEqualType(
        typedef1.ofType,
        typedef2.ofType,
        userTypedefs1,
        userTypedefs2
      ),

    makeDefaultValue: typedef => typedef.notNull ? {} : null,
  },
  
  'shape': {
    validate: (value, typedef, userTypedefs) =>
      typeof value === 'object' && (
        value === null
          ? !typedef.notNull
          : Object.keys(value).every(key =>
            hasOwnProperty(typedef.fields, key) &&
            isValidValue(value[key], typedef.fields[key], userTypedefs))
      ),
    
    print: (typedef, userTypedefs) => {
      const structure = Object.keys(typedef.fields)
        .map(key => `${key}:${printType(typedef.fields[key], userTypedefs)}`)
        .join(', ');
  
      return `shape(${structure})`;
    },
    
    isEqualType: (typedef1, typedef2, userTypedefs1, userTypedefs2) => {
      if (!!typedef1.notNull !== !!typedef2.notNull) return false;

      const keys1 = Object.keys(typedef1.fields),
        keys2 = Object.keys(typedef2.fields);

      if (keys1.length !== keys2.length) return false;

      return keys1.every(key => {
        if (!hasOwnProperty(typedef2, key)) return false;

        return isEqualType(
          typedef1.fields[key],
          typedef2.fields[key],
          userTypedefs1,
          userTypedefs2
        );
      });
    },

    makeDefaultValue: (typedef, userTypedefs) => typedef.notNull
      ? _mapValues(
        typedef.fields,
        fieldTypedef => makeDefaultValue(fieldTypedef, userTypedefs)
      )
      : null,
  },
  
  'component': {
    validate: returnTrue, // TODO: Write validator for component-type value
    print: /* istanbul ignore next */ () => 'component',
    isEqualType: returnTrue,
    makeDefaultValue: returnNull,
  },
  
  'func': {
    validate: returnTrue, // TODO: Write validator for func-type value
    print: /* istanbul ignore next */ () => 'func',
    isEqualType: returnFalse, // TODO: Write actual checker
    makeDefaultValue: returnNull,
  },
};
/* eslint-enable quote-props, no-use-before-define */

/**
 *
 * @param {TypeDefinition} typedef
 * @param {?Object<string, TypeDefinition>} userTypedefs
 * @returns {?TypeDefinition}
 */
const resolveTypedef = exports.resolveTypedef = (typedef, userTypedefs) => {
  if (BUILT_IN_PROP_TYPES.has(typedef.type)) return typedef;

  return (userTypedefs && userTypedefs[typedef.type])
    ? Object.assign({}, typedef, userTypedefs[typedef.type])
    : null;
};

/**
 *
 * @param {*} value
 * @param {TypeDefinition} typedef
 * @param {?Object<string, TypeDefinition>} userTypedefs
 * @return {boolean}
 */
const isValidValue = exports.isValidValue = (value, typedef, userTypedefs) => {
  const resolvedTypedef = resolveTypedef(typedef, userTypedefs);

  if (!resolvedTypedef)
    throw new Error(`Cannot resolve type '${typedef.type}'`);

  return TYPES[resolvedTypedef.type].validate(
    value,
    resolvedTypedef,
    userTypedefs
  );
};

/**
 *
 * @param {TypeDefinition} typedef
 * @param {?Object<string, TypeDefinition>} userTypedefs
 * @return {string}
 */
const printType = exports.printType = (typedef, userTypedefs) => {
  const resolvedTypedef = resolveTypedef(typedef, userTypedefs);

  if (!resolvedTypedef)
    throw new Error(`Cannot resolve type '${typedef.type}'`);

  return TYPES[resolvedTypedef.type].print(resolvedTypedef, userTypedefs);
};

/**
 *
 * @param {TypeDefinition} typedef1
 * @param {TypeDefinition} typedef2
 * @param {?Object<string, TypeDefinition>} userTypedefs1
 * @param {?Object<string, TypeDefinition>} userTypedefs2
 * @return {boolean}
 */
const isEqualType = exports.isEqualType = (
  typedef1,
  typedef2,
  userTypedefs1,
  userTypedefs2
) => {
  const resolvedTypedef1 = resolveTypedef(typedef1, userTypedefs1);

  if (!resolvedTypedef1)
    throw new Error(`Cannot resolve type '${typedef1.type}'`);

  const resolvedTypedef2 = resolveTypedef(typedef2, userTypedefs2);

  if (!resolvedTypedef2)
    throw new Error(`Cannot resolve type '${typedef2.type}'`);

  if (resolvedTypedef1.type !== resolvedTypedef2.type) return false;

  return TYPES[resolvedTypedef1.type].isEqualType(
    resolvedTypedef1,
    resolvedTypedef2,
    userTypedefs1,
    userTypedefs2
  );
};

/**
 *
 * @param {TypeDefinition} typedef
 * @param {(string|number)[]} valuePath
 * @param {?Object<string, TypeDefinition>} userTypedefs
 * @return {TypeDefinition}
 */
exports.getNestedTypedef = (
  typedef,
  valuePath,
  userTypedefs
) => valuePath.reduce(
  (acc, cur) => {
    const resolvedTypedef = resolveTypedef(acc, userTypedefs);

    if (!resolvedTypedef)
      throw new Error(`getNestedTypedef(): Cannot resolve type '${acc.type}'`);

    if (typeof cur === 'string') {
      if (resolvedTypedef.type === 'objectOf') {
        return resolvedTypedef.ofType;
      } else if (resolvedTypedef.type === 'shape') {
        return resolvedTypedef.fields[cur];
      } else {
        throw new Error(
          `getNestedTypedef(): incompatible type: ${resolvedTypedef.type}`
        );
      }
    } else if (typeof cur === 'number') {
      if (resolvedTypedef.type === 'arrayOf') {
        return resolvedTypedef.ofType;
      } else {
        throw new Error(
          `getNestedTypedef(): incompatible type: ${resolvedTypedef.type}`
        );
      }
    } else {
      throw new Error(
        'getNestedTypedef(): valuePath can contain ' +
        `only numbers and strings, got ${cur}`
      );
    }
  },

  typedef
);

const makeDefaultValue = exports.makeDefaultValue = (typedef, userTypedefs) => {
  const resolvedTypedef = resolveTypedef(typedef, userTypedefs);

  if (!resolvedTypedef)
    throw new Error(`Cannot resolve type '${typedef.type}'`);

  return TYPES[resolvedTypedef.type].makeDefaultValue(typedef, userTypedefs);
};
