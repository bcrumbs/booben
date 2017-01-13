/**
 * @author Dmitriy Bizyaev
 */

'use strict';

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

/* eslint-disable quote-props, no-use-before-define */
const TYPES = exports.TYPES = {
  'string': {
    validate: value => typeof value === 'string',
    print: () => 'string',
  },
  
  'bool': {
    validate: value => typeof value === 'boolean',
    print: () => 'bool',
  },
  
  'int': {
    validate: value => isNumber(value) && value % 1 === 0,
    print: () => 'int',
  },
  
  'float': {
    validate: value => isNumber(value),
    print: () => 'float',
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
  },
  
  'array': {
    validate: value => Array.isArray(value),
    print: () => 'array',
  },
  
  'arrayOf': {
    validate: (value, typedef, userTypedefs) =>
      Array.isArray(value) && value.every(item =>
        isValidValue(item, typedef.ofType, userTypedefs)),
    
    print: (typedef, userTypedefs) =>
      `arrayOf(${printType(typedef.ofType, userTypedefs)})`,
  },
  
  'object': {
    validate: (value, typedef) =>
      typeof value === 'object' && (typedef.notNull || value !== null),
    
    print: () => 'object',
  },
  
  'objectOf': {
    validate: (value, typedef, userTypedefs) =>
      typeof value === 'object' && (
        value !== null
          ? !typedef.notNull
          : Object.keys(value).every(key =>
            isValidValue(value[key], typedef.ofType, userTypedefs))
      ),
    
    print: (typedef, userTypedefs) =>
      `objectOf(${printType(typedef.ofType, userTypedefs)})`,
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
  },
  
  'component': {
    validate: () => true, // TODO: Write validator for component-type value
    print: () => 'component',
  },
  
  'func': {
    validate: () => true, // TODO: Write validator for func-type value
    print: () => 'func',
  },
};
/* eslint-enable quote-props, no-use-before-define */

/**
 *
 * @param {*} value
 * @param {TypeDefinition} typedef
 * @param {Object<string, Object>} types
 * @return {boolean}
 */
const isValidValue = exports.isValidValue = (value, typedef, userTypedefs) => {
  if (BUILT_IN_PROP_TYPES.has(typedef.type)) {
    return TYPES[typedef.type].validate(value, typedef, userTypedefs);
  } else {
    const resolvedType = userTypedefs[typedef.type];
    return TYPES[resolvedType.type].validate(value, resolvedType, userTypedefs);
  }
};

/**
 *
 * @param {TypeDefinition} typedef
 * @return {string}
 */
const printType = exports.printType = (typedef, userTypedefs) => {
  if (BUILT_IN_PROP_TYPES.has(typedef.type)) {
    return TYPES[typedef.type].print(typedef);
  } else {
    const resolvedType = userTypedefs[typedef.type];
    return TYPES[resolvedType.type].print(resolvedType, userTypedefs);
  }
};
