/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import { PropTypes } from 'react';
import _mapValues from 'lodash.mapvalues';
import { resolveTypedef } from '@jssy/types';
import { returnArg, returnNull } from '../../../utils/misc';

/**
 * @typedef {Object} PropsItemPropTypeOption
 * @property {*} value
 * @property {string} text
 * @property {boolean} disabled
 */

/**
 * @typedef {Object} PropsItemPropType
 * @property {string} label
 * @property {string} secondaryLabel
 * @property {number} view
 * @property {string} image
 * @property {string} tooltip
 * @property {boolean} linkable
 * @property {boolean} checkable
 * @property {boolean} required
 * @property {PropsItemPropTypeOption[]} [options]
 * @property {Object<string, PropsItemPropType>} [fields]
 * @property {PropsItemPropType} [ofType]
 * @property {Function} [transformValue]
 * @property {Function} [formatItemLabel]
 */

/**
 * @typedef {Object} PropsItemValue
 * @property {*} value
 * @property {boolean} linked
 * @property {string} [linkedWith]
 * @property {boolean} [checked]
 * @property {string} [message]
 * @property {boolean} [requirementFulfilled]
 */

/**
 *
 * @type {Object<string, number>}
 */
export const PropViews = {
  EMPTY: 0,
  INPUT: 1,
  TEXTAREA: 2,
  LIST: 3,
  TOGGLE: 4,
  COMPONENT: 5,
  SHAPE: 6,
  OBJECT: 7,
  ARRAY: 8,
};

/**
 *
 * @type {Object<string, number>}
 * @const
 */
const JSSY_TYPE_TO_VIEW = {
  string: PropViews.INPUT,
  bool: PropViews.TOGGLE,
  int: PropViews.INPUT,
  float: PropViews.INPUT,
  oneOf: PropViews.LIST,
  component: PropViews.COMPONENT,
  shape: PropViews.SHAPE,
  objectOf: PropViews.OBJECT,
  arrayOf: PropViews.ARRAY,
  object: PropViews.EMPTY,
  array: PropViews.EMPTY,
  func: PropViews.EMPTY,
};

/**
 *
 * @param {string} jssyType
 * @return {number}
 */
export const jssyTypeToView = jssyType =>
  JSSY_TYPE_TO_VIEW[jssyType] || PropViews.EMPTY;

export const ValueShape = PropTypes.shape({
  value: PropTypes.any,
  linked: PropTypes.bool,
  linkedWith: PropTypes.string,
  checked: PropTypes.bool,
  message: PropTypes.string,
  requirementFulfilled: PropTypes.bool,
});

const propTypeShapeFields = {
  label: PropTypes.string,
  secondaryLabel: PropTypes.string,
  view: PropTypes.oneOf(Object.values(PropViews)),
  image: PropTypes.string,
  tooltip: PropTypes.string,
  linkable: PropTypes.bool,
  checkable: PropTypes.bool,
  required: PropTypes.bool,
  transformValue: PropTypes.func,

  // For 'object' and 'array' views
  formatItemLabel: PropTypes.func,

  // Options for 'list' view
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any,
    text: PropTypes.string,
    disabled: PropTypes.bool,
  })),
};

// Fields for 'shape' view
propTypeShapeFields.fields =
  PropTypes.objectOf(PropTypes.shape(propTypeShapeFields));

// Type for 'array' and 'object' views
propTypeShapeFields.ofType = PropTypes.shape(propTypeShapeFields);

export const PropTypeShape = PropTypes.shape(propTypeShapeFields);

/**
 *
 * @type {Set}
 */
const complexViews = new Set([
  PropViews.SHAPE,
  PropViews.OBJECT,
  PropViews.ARRAY,
]);

/**
 *
 * @param {string} view
 * @return {boolean}
 */
export const isComplexView = view => complexViews.has(view);

/**
 *
 * @type {string}
 */
const LINK_TEXT_ITEMS_SEPARATOR = ' -> ';

/**
 *
 * @param {Object} jssyValue
 * It is an {@link Immutable.Record} actually
 * (see app/models/JssyValue.js)
 * @param {JssyTypeDefinition} typedef
 * @param {?Object<string, JssyTypeDefinition>} [userTypedefs=null]
 * @return {PropsItemValue}
 */
export const jssyValueToPropValue = (
  jssyValue,
  typedef,
  userTypedefs = null,
) => {
  if (!jssyValue) return { value: null, isLinked: false };
  
  const resolvedTypedef = resolveTypedef(typedef, userTypedefs);
  const linked = jssyValue.isLinked();
  let value = null;
  let linkedWith = '';
  
  if (!linked) {
    if (jssyValue.source === 'static') {
      if (resolvedTypedef.type === 'int' || resolvedTypedef.type === 'float') {
        value = String(jssyValue.sourceData.value);
      } else if (
        resolvedTypedef.type === 'string' ||
        resolvedTypedef.type === 'bool' ||
        resolvedTypedef.type === 'oneOf'
      ) {
        value = jssyValue.sourceData.value;
      } else if (resolvedTypedef.type === 'shape') {
        value = _mapValues(resolvedTypedef.fields, (fieldMeta, fieldName) =>
          jssyValueToPropValue(
            jssyValue.sourceData.value.get(fieldName),
            fieldMeta,
            userTypedefs,
          ),
        );
      } else if (resolvedTypedef.type === 'objectOf') {
        jssyValue.sourceData.value.map(nestedValue => jssyValueToPropValue(
          nestedValue,
          resolvedTypedef.ofType,
          userTypedefs,
        )).toJS();
      } else if (resolvedTypedef.type === 'arrayOf') {
        value = jssyValue.sourceData.value.map(nestedValue =>
          jssyValueToPropValue(
            nestedValue,
            resolvedTypedef.ofType,
            userTypedefs,
          ),
        ).toJS();
      }
    } else if (jssyValue.source === 'designer') {
      // true if component exists, false otherwise
      if (resolvedTypedef.type === 'component')
        value = jssyValue.sourceData.rootId !== -1;
    }
  } else if (jssyValue.source === 'data') {
    if (jssyValue.sourceData.queryPath) {
      linkedWith = jssyValue.sourceData.queryPath
        .map(step => step.field)
        .join(LINK_TEXT_ITEMS_SEPARATOR);
    }
  } else if (jssyValue.source === 'function') {
    linkedWith = jssyValue.sourceData.function;
  } else if (jssyValue.source === 'static') {
    linkedWith = jssyValue.sourceData.ownerPropName;
  } else if (jssyValue.source === 'state') {
    linkedWith = `Component ${jssyValue.sourceData.componentId}`;
  }
  
  return { value, linked, linkedWith };
};

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceIntValue = value => {
  const maybeRet = parseInt(value, 10);
  if (!isFinite(maybeRet)) return 0;
  return maybeRet;
};

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceFloatValue = value => {
  const maybeRet = parseFloat(value);
  if (!isFinite(maybeRet)) return 0.0;
  return maybeRet;
};

/**
 *
 * @template Extra
 * @param {JssyTypeDefinition} jssyTypedef
 * @param {Extra} [extra=null]
 * @param {?function(jssyTypedef: JssyTypeDefinition, extra: Extra, isField: boolean, fieldName: string): Extra} [getNestedExtra=returnNull]
 * @param {function(propType: PropsItemPropType, extra: Extra, jssyTypedef: JssyTypeDefinition): PropsItemPropType} [applyExtra=returnArg]
 * @param {?Object<string, JssyTypeDefinition>} [userTypedefs=null]
 * @return {PropsItemPropType}
 */
export const jssyTypedefToPropType = (
  jssyTypedef,
  extra = null,
  getNestedExtra = returnNull,
  applyExtra = returnArg,
  userTypedefs = null,
) => {
  jssyTypedef = resolveTypedef(jssyTypedef, userTypedefs);
  if (typeof getNestedExtra !== 'function') getNestedExtra = returnNull;
  if (typeof applyExtra !== 'function') applyExtra = returnArg;
  
  const ret = {
    label: '',
    secondaryLabel: jssyTypedef.type,
    view: jssyTypeToView(jssyTypedef.type),
    image: '',
    tooltip: '',
    linkable: false,
    checkable: false,
    required: false,
    transformValue: null,
    formatItemLabel: returnArg,
  };
  
  if (jssyTypedef.type === 'int') {
    ret.transformValue = coerceIntValue;
  } else if (jssyTypedef.type === 'float') {
    ret.transformValue = coerceFloatValue;
  } else if (jssyTypedef.type === 'oneOf') {
    ret.options = jssyTypedef.options.map(option => ({
      value: option.value,
      text: String(option.value),
    }));
  } else if (jssyTypedef.type === 'shape') {
    ret.fields = _mapValues(jssyTypedef.fields, (fieldTypedef, fieldName) => {
      //noinspection JSCheckFunctionSignatures
      const nestedExtra = getNestedExtra(jssyTypedef, extra, true, fieldName);
      
      return jssyTypedefToPropType(
        fieldTypedef,
        nestedExtra,
        getNestedExtra,
        applyExtra,
        userTypedefs,
      );
    });
  } else if (
    jssyTypedef.type === 'arrayOf' ||
    jssyTypedef.type === 'objectOf'
  ) {
    //noinspection JSCheckFunctionSignatures
    const nestedExtra = getNestedExtra(jssyTypedef, extra, false, '');
  
    ret.ofType = jssyTypedefToPropType(
      jssyTypedef.ofType,
      nestedExtra,
      getNestedExtra,
      applyExtra,
      userTypedefs,
    );
  }
  
  //noinspection JSCheckFunctionSignatures
  return applyExtra(ret, extra, jssyTypedef) || ret;
};
