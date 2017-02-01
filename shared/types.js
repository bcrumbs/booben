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
 * @param {*} arg
 * @return {*}
 */
const returnArg = /* istanbul ignore next */ arg => arg;

/**
 *
 * @param {Object} object
 * @param {string} key
 * @return {boolean}
 */
const hasOwnProperty = /* istanbul ignore next */ (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

/**
 *
 * @param {OneOfOption[]} options1
 * @param {OneOfOption[]} options2
 * @return {boolean}
 */
const oneOfOptionsAreEqual = (options1, options2) => {
  if (options1.length !== options2.length) return false;
  
  return options1.every(option1 =>
    !!options2.find(option2 => option2.value === option1.value));
};

/* eslint-disable quote-props, no-use-before-define */
const TYPES = {
  'string': {
    validate: value => typeof value === 'string',
    print: () => 'string',
    isEqualType: returnTrue,
    isCompatibleType: (_, typedef2) =>
      typedef2.type === 'string' ||
      typedef2.type === 'int' ||
      typedef2.type === 'float',
    makeDefaultValue: () => '',
    coerce: {
      'string': returnArg,
      'int': value => String(value),
      'float': value => String(value),
    },
  },
  
  'bool': {
    validate: value => typeof value === 'boolean',
    print: () => 'bool',
    isEqualType: returnTrue,
    isCompatibleType: (_, typedef2) =>
      typedef2.type === 'bool' ||
      typedef2.type === 'string' ||
      typedef2.type === 'int' ||
      typedef2.type === 'float',
    makeDefaultValue: () => false,
    coerce: {
      'bool': returnArg,
      'string': value => value.length !== 0,
      'int': value => value !== 0,
      'float': value => value !== 0,
    },
  },
  
  'int': {
    validate: value => isNumber(value) && value % 1 === 0,
    print: () => 'int',
    isEqualType: returnTrue,
    isCompatibleType: (_, typedef2) => typedef2.type === 'int',
    makeDefaultValue: () => 0,
    coerce: {
      'int': returnArg,
    },
  },
  
  'float': {
    validate: value => isNumber(value),
    print: () => 'float',
    isEqualType: returnTrue,
    isCompatibleType: (_, typedef2) =>
      typedef2.type === 'float' ||
      typedef2.type === 'int',
    makeDefaultValue: () => 0,
    coerce: {
      'float': returnArg,
      'int': value => Math.round(value),
    },
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
    
    isEqualType: (typedef1, typedef2) => oneOfOptionsAreEqual(
      typedef1.options,
      typedef2.options
    ),
  
    isCompatibleType: (typedef1, typedef2) =>
      typedef2.type === 'oneOf' &&
      oneOfOptionsAreEqual(
        typedef1.options,
        typedef2.options
      ),

    makeDefaultValue: typedef => typedef.options[0].value,
    coerce: {
      'oneOf': returnArg,
    },
  },
  
  'array': {
    validate: value => Array.isArray(value),
    print: () => 'array',
    isEqualType: returnTrue,
    isCompatibleType: (_, typedef2) =>
      typedef2.type === 'array' ||
      typedef2.type === 'arrayOf',
    
    makeDefaultValue: () => [],
    coerce: {
      'array': returnArg,
      'arrayOf': returnArg,
    },
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
  
    isCompatibleType: (typedef1, typedef2, userTypedefs1, userTypedefs2) =>
      typedef2.type === 'arrayOf' &&
      isCompatibleType(
        typedef1.ofType,
        typedef2.ofType,
        userTypedefs1,
        userTypedefs2
      ),

    makeDefaultValue: () => [],
    coerce: {
      'arrayOf': (
        value,
        typedefFrom,
        typedefTo,
        userTypedefsFrom,
        userTypedefsTo
      ) => value.map(item => coerceValue(
        item,
        typedefFrom.ofType,
        typedefTo.ofType,
        userTypedefsFrom,
        userTypedefsTo
      )),
    },
  },
  
  'object': {
    validate: (value, typedef) =>
      typeof value === 'object' && (!typedef.notNull || value !== null),
    
    print: () => 'object',
    
    isEqualType: (typedef1, typedef2) =>
      !!typedef1.notNull === !!typedef2.notNull,
    
    isCompatibleType: (typedef1, typedef2) =>
      (
        typedef2.type === 'object' ||
        typedef2.type === 'objectOf' ||
        typedef2.type === 'shape'
      ) && (
        typedef1.notNull
          ? typedef2.notNull
          : true
      ),

    makeDefaultValue: (typedef, _, options) =>
      (typedef.notNull || options.nonNull) ? null : {},
  
    coerce: {
      'object': returnArg,
      'objectOf': returnArg,
      'shape': returnArg,
    },
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
  
    isCompatibleType: (typedef1, typedef2, userTypedefs1, userTypedefs2) =>
      typedef2.type === 'objectOf' &&
      isCompatibleType(
        typedef1.ofType,
        typedef2.ofType,
        userTypedefs1,
        userTypedefs2
      ) && (
        typedef1.notNull
          ? typedef2.notNull
          : true
      ),
  
    makeDefaultValue: (typedef, _, options) =>
      (typedef.notNull || options.nonNull) ? null : {},
    
    coerce: {
      'objectOf': (
        value,
        typedefFrom,
        typedefTo,
        userTypedefsFrom,
        userTypedefsTo
      ) => {
        if (value === null) return null;
        
        return _mapValues(value, item => coerceValue(
          item,
          typedefFrom.ofType,
          typedefTo.ofType,
          userTypedefsFrom,
          userTypedefsTo
        ));
      },
    },
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
  
    isCompatibleType: (typedef1, typedef2, userTypedefs1, userTypedefs2) => {
      if (typedef2.type !== 'shape') return false;
      if (typedef1.notNull && !typedef2.notNull) return false;
  
      const keys1 = Object.keys(typedef1.fields),
        keys2 = Object.keys(typedef2.fields);
  
      if (keys1.length !== keys2.length) return false;
  
      return keys1.every(key => {
        if (!hasOwnProperty(typedef2, key)) return false;
    
        return isCompatibleType(
          typedef1.fields[key],
          typedef2.fields[key],
          userTypedefs1,
          userTypedefs2
        );
      });
    },

    makeDefaultValue: (typedef, userTypedefs, options) =>
      (typedef.notNull || options.nonNull)
        ? _mapValues(
          typedef.fields,
          fieldTypedef => _makeDefaultValue(
            fieldTypedef,
            userTypedefs,
            options.deepNonNull
              ? options
              : { nonNull: false, deepNonNull: false }
          )
        )
        : null,
  
    coerce: {
      'shape': (
        value,
        typedefFrom,
        typedefTo,
        userTypedefsFrom,
        userTypedefsTo
      ) => {
        if (value === null) return null;
        
        return _mapValues(typedefFrom.fields, (_, fieldName) => coerceValue(
          value[fieldName],
          typedefFrom.fields[fieldName],
          typedefTo.fields[fieldName],
          userTypedefsFrom,
          userTypedefsTo
        ));
      },
    },
  },
  
  'component': {
    validate: returnTrue, // TODO: Write validator for component-type value
    print: /* istanbul ignore next */ () => 'component',
    isEqualType: returnTrue,
    isCompatibleType: (_, typedef2) => typedef2.type === 'component',
    makeDefaultValue: returnNull,
    coerce: {},
  },
  
  'func': {
    validate: returnTrue, // TODO: Write validator for func-type value
    print: /* istanbul ignore next */ () => 'func',
    isEqualType: returnFalse, // TODO: Write actual checker
    isCompatibleType: returnFalse, // TODO: Write actual checker
    makeDefaultValue: returnNull,
    coerce: {},
  },
};
/* eslint-enable quote-props, no-use-before-define */

/**
 *
 * @param {TypeDefinition} typedef
 * @param {?Object<string, TypeDefinition>} [userTypedefs=null]
 * @returns {?TypeDefinition}
 */
const resolveTypedef = (typedef, userTypedefs = null) => {
  if (BUILT_IN_PROP_TYPES.has(typedef.type)) return typedef;

  return (userTypedefs && userTypedefs[typedef.type])
    ? Object.assign({}, typedef, userTypedefs[typedef.type])
    : null;
};

/**
 *
 * @param {*} value
 * @param {TypeDefinition} typedef
 * @param {?Object<string, TypeDefinition>} [userTypedefs=null]
 * @return {boolean}
 */
const isValidValue = (value, typedef, userTypedefs = null) => {
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
 * @param {?Object<string, TypeDefinition>} [userTypedefs=null]
 * @return {string}
 */
const printType = (typedef, userTypedefs = null) => {
  const resolvedTypedef = resolveTypedef(typedef, userTypedefs);

  if (!resolvedTypedef)
    throw new Error(`Cannot resolve type '${typedef.type}'`);

  return TYPES[resolvedTypedef.type].print(resolvedTypedef, userTypedefs);
};

/**
 *
 * @param {TypeDefinition} typedef1
 * @param {TypeDefinition} typedef2
 * @param {?Object<string, TypeDefinition>} [userTypedefs1=null]
 * @param {?Object<string, TypeDefinition>} [userTypedefs2=null]
 * @return {boolean}
 */
const isEqualType = (
  typedef1,
  typedef2,
  userTypedefs1 = null,
  userTypedefs2 = null
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
 * @param {TypeDefinition} typedef1
 * @param {TypeDefinition} typedef2
 * @param {?Object<string, TypeDefinition>} [userTypedefs1=null]
 * @param {?Object<string, TypeDefinition>} [userTypedefs2=null]
 * @return {boolean}
 */
const isCompatibleType = (
  typedef1,
  typedef2,
  userTypedefs1 = null,
  userTypedefs2 = null
) => {
  const resolvedTypedef1 = resolveTypedef(typedef1, userTypedefs1);
  
  if (!resolvedTypedef1)
    throw new Error(`Cannot resolve type '${typedef1.type}'`);
  
  const resolvedTypedef2 = resolveTypedef(typedef2, userTypedefs2);
  
  if (!resolvedTypedef2)
    throw new Error(`Cannot resolve type '${typedef2.type}'`);
  
  return TYPES[resolvedTypedef1.type].isCompatibleType(
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
 * @param {?Object<string, TypeDefinition>} [userTypedefs=null]
 * @return {TypeDefinition}
 */
const getNestedTypedef = (
  typedef,
  valuePath,
  userTypedefs = null
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

/**
 *
 * @param {TypeDefinition} typedef
 * @param {Object<string, TypeDefinition>} userTypedefs
 * @param {Object} options
 * @param {boolean} options.nonNull
 * @param {boolean} options.deepNonNull
 * @return {*}
 */
const _makeDefaultValue = (typedef, userTypedefs, options) => {
  const resolvedTypedef = resolveTypedef(typedef, userTypedefs);
  
  if (!resolvedTypedef)
    throw new Error(`Cannot resolve type '${typedef.type}'`);
  
  return TYPES[resolvedTypedef.type].makeDefaultValue(
    typedef,
    userTypedefs,
    options
  );
};

/**
 *
 * @param {TypeDefinition} typedef
 * @param {?Object<string, TypeDefinition>} [userTypedefs=null]
 * @return {*}
 */
const makeDefaultValue = (typedef, userTypedefs = null) =>
  _makeDefaultValue(typedef, userTypedefs, {
    nonNull: false,
    deepNonNull: false,
  });

/**
 *
 * @param {TypeDefinition} typedef
 * @param {?Object<string, TypeDefinition>} [userTypedefs=null]
 * @return {*}
 */
const makeDefaultNonNullValue = (typedef, userTypedefs = null) =>
  _makeDefaultValue(typedef, userTypedefs, {
    nonNull: true,
    deepNonNull: false,
  });

/**
 *
 * @param {*} value
 * @param {TypeDefinition} typedefFrom
 * @param {TypeDefinition} typedefTo
 * @param {?Object<string, TypeDefinition>} [userTypedefsFrom=null]
 * @param {?Object<string, TypeDefinition>} [userTypedefsTo=null]
 */
const coerceValue = (
  value,
  typedefFrom,
  typedefTo,
  userTypedefsFrom = null,
  userTypedefsTo = null
) => {
  const resolvedTypedefFrom = resolveTypedef(typedefFrom, userTypedefsFrom);
  
  if (!resolvedTypedefFrom)
    throw new Error(`Cannot resolve type '${typedefFrom.type}'`);
  
  const resolvedTypedefTo = resolveTypedef(typedefTo, userTypedefsTo);
  
  if (!resolvedTypedefTo)
    throw new Error(`Cannot resolve type '${typedefTo.type}'`);
  
  const coerceFn =
    TYPES[resolvedTypedefTo.type].coerce[resolvedTypedefFrom.type];
  
  if (!coerceFn) {
    throw new Error(
      `Cannot coerce '${resolvedTypedefFrom.type}' ` +
      `to '${resolvedTypedefTo.type}'`
    );
  }
  
  return coerceFn(
    value,
    resolvedTypedefFrom,
    resolvedTypedefTo,
    userTypedefsFrom,
    userTypedefsTo
  );
};

exports.resolveTypedef = resolveTypedef;
exports.getNestedTypedef = getNestedTypedef;
exports.isValidValue = isValidValue;
exports.printType = printType;
exports.isEqualType = isEqualType;
exports.isCompatibleType = isCompatibleType;
exports.makeDefaultValue = makeDefaultValue;
exports.makeDefaultNonNullValue = makeDefaultNonNullValue;
exports.coerceValue = coerceValue;
