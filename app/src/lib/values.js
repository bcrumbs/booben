/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import _forOwn from 'lodash.forown';
import { TypeNames, resolveTypedef, coerceValue } from '@jssy/types';
import { getFieldByPath, getJssyValueDefOfField } from './schema';
import { extractPropValueFromData } from './graphql';
import { getFunctionInfo, formatFunctionId } from './functions';
import { getComponentMeta } from './meta';

import {
  mapListToArray,
  mapMapToObject,
  isUndef,
  hasOwnProperty,
  returnNull,
} from '../utils/misc';

import { ROUTE_PARAM_VALUE_DEF, NO_VALUE } from '../constants/misc';

/**
 * @typedef {Object} AJAXRequestResult
 * @property {?Error} error
 * @property {number} status
 * @property {Object<string, string>} headers
 * @property {*} body
 */

/**
 * @typedef {Object} ValueContext
 * @property {?Object<string, Object<string, ComponentMeta>>} [meta=null]
 * @property {?DataSchema} [schema=null]
 * @property {?Immutable.Map<number, Object>} [components=null]
 * @property {?Immutable.Map<number, Immutable.Map<string, *>>} [componentsState=null]
 * @property {?Object<string, *>} [propsFromOwner=null]
 * @property {?DataContextsInfo} [dataContextInfo=null]
 * @property {?Immutable.Map<string, Object>} [projectFunctions=null]
 * @property {?Immutable.Map<Object, DataContextsInfo>} [theMap=null]
 * @property {?Object} [data=null]
 * @property {?Object<string, string>} [routeParams=null]
 * @property {?Array<*>} [actionArgValues=null]
 * @property {?JssyValueDefinition} [actionValueDef=null]
 * @property {?Object<string, JssyTypeDefinition>} [actionUserTypedefs=null]
 * @property {?AJAXRequestResult} [ajaxRequestResult=null]
 * @property {?ReactComponent} [BuilderComponent=null]
 * @property {?function(ownProps: Object<string, *>, jssyValue: Object, context: ValueContext): Object<string, *>} [getBuilderProps=null]
 * @property {?Function} [handleActions=null]
 */

const defaultContext = {
  meta: null,
  schema: null,
  components: null,
  componentsState: null,
  propsFromOwner: null,
  dataContextInfo: null,
  projectFunctions: null,
  theMap: null,
  data: null,
  routeParams: null,
  actionArgValues: null,
  actionValueDef: null,
  actionUserTypedefs: null,
  ajaxRequestResult: null,
  BuilderComponent: null,
  getBuilderProps: null,
  handleActions: null,
};

/* eslint-disable no-use-before-define */

/**
 *
 * @param {Object} jssyValue
 * @param {?ValueContext} context
 */
const buildOwnerPropValue = (jssyValue, context) => {
  const { propsFromOwner } = context;
  const propName = jssyValue.sourceData.ownerPropName;

  if (propsFromOwner === null || !hasOwnProperty(propsFromOwner, propName)) {
    return NO_VALUE;
  }

  return propsFromOwner[propName];
};

/**
 *
 * @param {Object} jssyValue
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildStaticValue = (jssyValue, valueDef, userTypedefs, context) => {
  const resolvedTypedef = resolveTypedef(valueDef, userTypedefs);

  if (resolvedTypedef.type === TypeNames.SHAPE) {
    if (jssyValue.sourceData.value === null) return null;

    const ret = {};

    _forOwn(resolvedTypedef.fields, (fieldMeta, fieldName) => {
      const fieldValue = jssyValue.sourceData.value.get(fieldName);

      if (!isUndef(fieldValue)) {
        ret[fieldName] = buildValue(
          fieldValue,
          fieldMeta,
          userTypedefs,
          context,
        );
      }
    });

    return ret;
  } else if (resolvedTypedef.type === TypeNames.OBJECT_OF) {
    if (jssyValue.sourceData.value === null) return null;

    return mapMapToObject(jssyValue.sourceData.value, nestedValue => buildValue(
      nestedValue,
      resolvedTypedef.ofType,
      userTypedefs,
      context,
    ));
  } else if (resolvedTypedef.type === TypeNames.ARRAY_OF) {
    return mapListToArray(jssyValue.sourceData.value, nestedValue => buildValue(
      nestedValue,
      resolvedTypedef.ofType,
      userTypedefs,
      context,
    ));
  } else {
    return jssyValue.sourceData.value;
  }
};

/**
 *
 * @param {Object} jssyValue
 * @return {*}
 */
const buildConstValue = jssyValue => jssyValue.sourceData.value;

/**
 *
 * @param {Object} jssyValue
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildDataValue = (jssyValue, valueDef, userTypedefs, context) => {
  const { schema, propsFromOwner, dataContextInfo, data } = context;

  if (jssyValue.sourceData.queryPath === null) {
    return NO_VALUE;
  }

  if (schema === null) {
    throw new Error(
      'buildDataValue(): schema is required to build data values',
    );
  }

  const path = mapListToArray(
    jssyValue.sourceData.queryPath,
    step => step.field,
  );

  let rawValue;
  let field;

  if (jssyValue.sourceData.dataContext.size > 0) {
    const dataContextName = jssyValue.sourceData.dataContext.last();

    if (
      dataContextInfo === null ||
      !hasOwnProperty(dataContextInfo, dataContextName)
    ) {
      return NO_VALUE;
    }

    const ourDataContextInfo = dataContextInfo[dataContextName];

    if (
      propsFromOwner === null ||
      !hasOwnProperty(propsFromOwner, ourDataContextInfo.ownerPropName)
    ) {
      return NO_VALUE;
    }

    field = getFieldByPath(schema, path, ourDataContextInfo.type);
    rawValue = extractPropValueFromData(
      jssyValue,
      propsFromOwner[ourDataContextInfo.ownerPropName],
      schema,
      ourDataContextInfo.type,
    );
  } else {
    if (data === null) {
      return NO_VALUE;
    }

    field = getFieldByPath(schema, path);
    rawValue = extractPropValueFromData(jssyValue, data, schema);
  }

  return coerceValue(
    rawValue,
    getJssyValueDefOfField(field, schema),
    valueDef,
    null,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} jssyValue
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildFunctionValue = (jssyValue, valueDef, userTypedefs, context) => {
  const { projectFunctions } = context;

  const fnInfo = getFunctionInfo(
    jssyValue.sourceData.functionSource,
    jssyValue.sourceData.function,
    projectFunctions,
  );

  if (fnInfo === null) {
    const functionId = formatFunctionId(
      jssyValue.sourceData.functionSource,
      jssyValue.sourceData.function,
    );

    throw new Error(`buildFunctionValue(): function not found: ${functionId}`);
  }

  const argValues = mapListToArray(fnInfo.args, (argInfo, argNum) => {
    const argValue = jssyValue.sourceData.args.get(argInfo.name);

    let ret = NO_VALUE;

    if (argValue) {
      ret = buildValue(argValue, argInfo.typedef, userTypedefs, context);
    }

    if (ret === NO_VALUE) {
      if (argInfo.isRequired) {
        const functionId = formatFunctionId(
          jssyValue.sourceData.functionSource,
          jssyValue.sourceData.function,
        );

        throw new Error(
          `buildFunctionValue(): failed to build required argument ${argNum} ` +
          `for function ${functionId}`,
        );
      } else {
        ret = argInfo.defaultValue;
      }
    }

    return ret;
  });

  // TODO: Pass fns as last argument
  const rawValue = fnInfo.fn(...argValues, {});

  return coerceValue(
    rawValue,
    fnInfo.returnType,
    valueDef,
    null,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} jssyValue
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildStateValue = (jssyValue, valueDef, userTypedefs, context) => {
  const { meta, components, componentsState } = context;

  if (meta === null || components === null || componentsState === null) {
    throw new Error(
      'buildStateValue(): meta, components and componentsState ' +
      'are required to build state values',
    );
  }

  const componentId = jssyValue.sourceData.componentId;
  const stateSlot = jssyValue.sourceData.stateSlot;
  const componentState = componentsState.get(componentId);

  if (!componentState || !componentState.has(stateSlot)) {
    return NO_VALUE;
  }

  const rawValue = componentState.get(stateSlot);
  const sourceComponent = components.get(componentId);
  const sourceComponentMeta = getComponentMeta(sourceComponent.name, meta);
  const stateSlotMeta = sourceComponentMeta.state[stateSlot];

  return coerceValue(
    rawValue,
    stateSlotMeta,
    valueDef,
    sourceComponentMeta.types,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} jssyValue
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildRouteParamsValue = (jssyValue, valueDef, userTypedefs, context) => {
  const { routeParams } = context;

  if (routeParams === null) {
    throw new Error('buildRouteParamsValue(): routeParams is required');
  }

  const paramName = jssyValue.sourceData.paramName;

  if (!hasOwnProperty(routeParams, paramName)) {
    throw new Error(
      `buildRouteParamsValue(): unknown route param: ${paramName}`,
    );
  }

  return coerceValue(
    routeParams[paramName],
    ROUTE_PARAM_VALUE_DEF,
    valueDef,
    null,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} jssyValue
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildActionArgValue = (jssyValue, valueDef, userTypedefs, context) => {
  const { actionArgValues, actionValueDef, actionUserTypedefs } = context;

  if (
    actionArgValues === null ||
    actionValueDef === null ||
    actionUserTypedefs === null
  ) {
    throw new Error(
      'buildActionArgValue(): actionArgValues, actionValueDef and ' +
      'actionUserTypedefs are required',
    );
  }

  const argIdx = jssyValue.sourceData.arg;

  return coerceValue(
    actionArgValues[argIdx],
    actionValueDef.sourceConfigs.actions.args[argIdx],
    valueDef,
    actionUserTypedefs,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} jssyValue
 * @param {?ValueContext} context
 * @return {ReactComponent}
 */
const buildDesignerValue = (jssyValue, context) => {
  const { BuilderComponent, getBuilderProps } = context;

  if (!jssyValue.hasDesignedComponent()) return returnNull;

  if (BuilderComponent === null || getBuilderProps === null) {
    throw new Error(
      'buildDesignerValue(): BuilderComponent and getBuilderProps are required',
    );
  }

  const ret = ownProps => (
    <BuilderComponent {...getBuilderProps(ownProps, jssyValue, context)}>
      {ownProps.children}
    </BuilderComponent>
  );

  ret.displayName = `designerValueBuilder(${BuilderComponent})`;

  return ret;
};

/**
 *
 * @param {Object} jssyValue
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, JssyTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildActionsValue = (jssyValue, valueDef, userTypedefs, context) => {
  const { handleActions } = context;

  if (handleActions === null) {
    throw new Error('buildActionsValue(): handleActions is required');
  }

  return (...args) => {
    const nextValueContext = {
      ...context,
      actionArgValues: args,
      actionValueDef: valueDef,
      actionUserTypedefs: userTypedefs,
    };

    handleActions(jssyValue, valueDef, userTypedefs, nextValueContext);
  };
};

/**
 *
 * @param {Object} jssyValue
 * @param {JssyValueDefinition} valueDef
 * @param {?Object<string, JssyTypeDefinition>} [userTypedefs=null]
 * @param {?ValueContext} [context=null]
 */
export const buildValue = (
  jssyValue,
  valueDef,
  userTypedefs = null,
  context = null,
) => {
  const actualContext = context === null
    ? defaultContext
    : { ...defaultContext, ...context };

  if (jssyValue.sourceIs('static')) {
    if (jssyValue.sourceData.ownerPropName) {
      return buildOwnerPropValue(jssyValue, actualContext);
    } else {
      return buildStaticValue(jssyValue, valueDef, userTypedefs, actualContext);
    }
  } else if (jssyValue.sourceIs('const')) {
    return buildConstValue(jssyValue);
  } else if (jssyValue.sourceIs('data')) {
    return buildDataValue(jssyValue, valueDef, userTypedefs, actualContext);
  } else if (jssyValue.sourceIs('function')) {
    return buildFunctionValue(jssyValue, valueDef, userTypedefs, actualContext);
  } else if (jssyValue.sourceIs('state')) {
    return buildStateValue(jssyValue, valueDef, userTypedefs, actualContext);
  } else if (jssyValue.sourceIs('routeParams')) {
    return buildRouteParamsValue(
      jssyValue,
      valueDef,
      userTypedefs,
      actualContext,
    );
  } else if (jssyValue.sourceIs('actionArg')) {
    return buildActionArgValue(
      jssyValue,
      valueDef,
      userTypedefs,
      actualContext,
    );
  } else if (jssyValue.sourceIs('designer')) {
    return buildDesignerValue(jssyValue, actualContext);
  } else if (jssyValue.sourceIs('actions')) {
    return buildActionsValue(jssyValue, valueDef, userTypedefs, actualContext);
  } else {
    throw new Error(`buildValue(): unknown value source: ${jssyValue.source}`);
  }
};

/* eslint-enable no-use-before-define */

/**
 *
 * @param {Object} component
 * @param {Object<string, Object<string, ComponentMeta>>} meta
 * @param {ValueContext} valueContext
 * @param {?Array<string>} [stateSlots=null]
 * @return {Object<string, *>}
 * @private
 */
export const buildInitialComponentState = (
  component,
  meta,
  valueContext,
  stateSlots = null,
) => {
  const componentMeta = getComponentMeta(component.name, meta);

  if (!componentMeta.state) return {};

  const ret = {};

  const activeStateSlots = stateSlots === null
    ? Object.keys(componentMeta.state)
    : stateSlots;

  activeStateSlots.forEach(stateSlotName => {
    const stateSlot = componentMeta.state[stateSlotName];
    if (!stateSlot) return;

    const initialValue = stateSlot.initialValue;

    if (initialValue.source === 'const') {
      ret[stateSlotName] = initialValue.sourceData.value;
    } else if (initialValue.source === 'prop') {
      const propValue = component.props.get(initialValue.sourceData.propName);
      const propMeta = componentMeta.props[initialValue.sourceData.propName];
      const value = buildValue(
        propValue,
        propMeta,
        componentMeta.types,
        valueContext,
      );

      if (value !== NO_VALUE) {
        ret[stateSlotName] = value;
      }
    }
  });

  return ret;
};
