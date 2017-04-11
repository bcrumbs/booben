/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import { PropTypes } from 'react';
import _mapValues from 'lodash.mapvalues';
import { TypeNames, resolveTypedef } from '@jssy/types';
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
  [TypeNames.STRING]: PropViews.INPUT,
  [TypeNames.BOOL]: PropViews.TOGGLE,
  [TypeNames.INT]: PropViews.INPUT,
  [TypeNames.FLOAT]: PropViews.INPUT,
  [TypeNames.SCALAR]: PropViews.EMPTY,
  [TypeNames.ONE_OF]: PropViews.LIST,
  [TypeNames.COMPONENT]: PropViews.COMPONENT,
  [TypeNames.SHAPE]: PropViews.SHAPE,
  [TypeNames.OBJECT_OF]: PropViews.OBJECT,
  [TypeNames.ARRAY_OF]: PropViews.ARRAY,
  [TypeNames.OBJECT]: PropViews.EMPTY,
  [TypeNames.ARRAY]: PropViews.EMPTY,
  [TypeNames.FUNC]: PropViews.EMPTY,
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
  view: PropTypes.oneOf(Object.keys(PropViews).map(key => PropViews[key])),
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
      if (
        resolvedTypedef.type === TypeNames.INT ||
        resolvedTypedef.type === TypeNames.FLOAT
      ) {
        value = String(jssyValue.sourceData.value);
      } else if (
        resolvedTypedef.type === TypeNames.STRING ||
        resolvedTypedef.type === TypeNames.BOOL ||
        resolvedTypedef.type === TypeNames.ONE_OF
      ) {
        value = jssyValue.sourceData.value;
      } else if (resolvedTypedef.type === TypeNames.SHAPE) {
        value = _mapValues(resolvedTypedef.fields, (fieldMeta, fieldName) =>
          jssyValueToPropValue(
            jssyValue.sourceData.value.get(fieldName),
            fieldMeta,
            userTypedefs,
          ),
        );
      } else if (resolvedTypedef.type === TypeNames.OBJECT_OF) {
        jssyValue.sourceData.value.map(nestedValue => jssyValueToPropValue(
          nestedValue,
          resolvedTypedef.ofType,
          userTypedefs,
        )).toJS();
      } else if (resolvedTypedef.type === TypeNames.ARRAY_OF) {
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
      if (resolvedTypedef.type === TypeNames.COMPONENT)
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
 * @param {JssyValueDefinition} valueDef
 * @param {Extra} [extra=null]
 * @param {?function(jssyTypedef: JssyTypeDefinition, extra: Extra, isField: boolean, fieldName: string): Extra} [getNestedExtra=returnNull]
 * @param {function(propType: PropsItemPropType, extra: Extra, jssyTypedef: JssyTypeDefinition): PropsItemPropType} [applyExtra=returnArg]
 * @param {?Object<string, JssyTypeDefinition>} [userTypedefs=null]
 * @param {?function(index: number): string} [formatArrayItemLabel=returnArg]
 * @param {?function(key: string): string} [formatObjectKeyLabel=returnArg]
 * @return {PropsItemPropType}
 */
export const jssyTypedefToPropType = (
  valueDef,
  extra = null,
  getNestedExtra = returnNull,
  applyExtra = returnArg,
  userTypedefs = null,
  formatArrayItemLabel = returnArg,
  formatObjectKeyLabel = returnArg,
) => {
  valueDef = resolveTypedef(valueDef, userTypedefs);
  if (typeof getNestedExtra !== 'function') getNestedExtra = returnNull;
  if (typeof applyExtra !== 'function') applyExtra = returnArg;
  
  const ret = {
    label: '',
    secondaryLabel: valueDef.type,
    view: jssyTypeToView(valueDef.type),
    image: '',
    tooltip: '',
    linkable: false,
    checkable: false,
    required: false,
    transformValue: null,
    formatItemLabel: returnArg,
  };
  
  if (valueDef.type === TypeNames.INT) {
    ret.transformValue = coerceIntValue;
  } else if (valueDef.type === TypeNames.FLOAT) {
    ret.transformValue = coerceFloatValue;
  } else if (valueDef.type === TypeNames.ONE_OF) {
    ret.options = valueDef.options.map(option => ({
      value: option.value,
      text: String(option.value),
    }));
  } else if (valueDef.type === TypeNames.SHAPE) {
    ret.fields = _mapValues(valueDef.fields, (fieldTypedef, fieldName) => {
      //noinspection JSCheckFunctionSignatures
      const nestedExtra = getNestedExtra(valueDef, extra, true, fieldName);
      
      return jssyTypedefToPropType(
        fieldTypedef,
        nestedExtra,
        getNestedExtra,
        applyExtra,
        userTypedefs,
        formatArrayItemLabel,
        formatObjectKeyLabel,
      );
    });
  } else if (
    valueDef.type === TypeNames.ARRAY_OF ||
    valueDef.type === TypeNames.OBJECT_OF
  ) {
    //noinspection JSCheckFunctionSignatures
    const nestedExtra = getNestedExtra(valueDef, extra, false, '');
  
    ret.ofType = jssyTypedefToPropType(
      valueDef.ofType,
      nestedExtra,
      getNestedExtra,
      applyExtra,
      userTypedefs,
      formatArrayItemLabel,
      formatObjectKeyLabel,
    );
    
    if (valueDef.type === TypeNames.ARRAY_OF)
      ret.formatItemLabel = formatArrayItemLabel;
    else
      ret.formatItemLabel = formatObjectKeyLabel;
  }
  
  //noinspection JSCheckFunctionSignatures
  return applyExtra(ret, extra, valueDef) || ret;
};
